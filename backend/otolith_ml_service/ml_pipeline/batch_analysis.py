"""
batch_analysis.py - Batch process all otolith images
"""

import cv2
import numpy as np
import torch
from pathlib import Path
from scipy.signal import find_peaks
from scipy.ndimage import gaussian_filter1d
from PIL import Image
import matplotlib.pyplot as plt
import json
from typing import Dict, Tuple, List
import albumentations as A
from albumentations.pytorch import ToTensorV2
from skimage.exposure import equalize_adapthist
from tqdm import tqdm
import pandas as pd

from models.oto_segnet import create_oto_segnet


class BatchOtolithAnalyzer:
    """
    Batch otolith analysis system.
    """
    
    def __init__(self, model_path: str, species_map: dict, scale_factor: float = 10.0):
        """
        Initialize analyzer with trained model.
        """
        num_species = len(species_map)
        self.model = create_oto_segnet(model_type='full', num_species=num_species)
        
        # Load state dict
# FIX: Explicitly set weights_only=False to allow loading older models
        state_dict = torch.load(model_path, map_location='cpu', weights_only=False)
        self.model.load_state_dict(state_dict)
        self.model.eval()
        
        self.species_map = species_map
        self.scale_factor = scale_factor
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        
        print(f"✅ Model loaded on: {self.device}")
        print(f"   Parameters: {sum(p.numel() for p in self.model.parameters()):,}")
    
    
    def preprocess_image(self, image_path: str) -> Tuple[torch.Tensor, np.ndarray]:
        """Load and preprocess image."""
        original_img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
        
        if original_img is None:
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Apply CLAHE
        img_clahe = equalize_adapthist(original_img.astype(np.float32) / 255.0)
        img_clahe = (img_clahe * 255).astype(np.uint8)
        
        # Transform for model
        transform = A.Compose([
            A.Resize(256, 256),
            A.Normalize(mean=0.5, std=0.5),
            ToTensorV2()
        ])
        
        transformed = transform(image=img_clahe)
        img_tensor = transformed['image'].unsqueeze(0)
        
        return img_tensor, original_img
    
    
    def analyze_single(self, image_path: str, save_dir: str = None) -> Dict:
        """Analyze a single image."""
        # Preprocess
        img_tensor, original_img = self.preprocess_image(image_path)
        img_tensor = img_tensor.to(self.device).float()
        
        # Model inference
        with torch.no_grad():
            seg_pred, cls_pred = self.model(img_tensor)
        
        # Process predictions
        mask = (torch.sigmoid(seg_pred).squeeze().cpu().numpy() > 0.5).astype(np.uint8)
        species_probs = torch.softmax(cls_pred, dim=1).squeeze().cpu().numpy()
        
        # Resize mask back to original size
        h, w = original_img.shape[:2]
        mask_full = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)
        
        # Morphometrics
        morpho = self.compute_morphometrics(mask_full)
        
        # Age determination
        age_data = self.detect_rings_radial(original_img, mask_full, morpho['centroid'])
        
        # Species classification
        species_id = np.argmax(species_probs)
        species_name = self.species_map[species_id]
        confidence = species_probs[species_id]
        
        overlay_path = None
        profile_path = None

        if save_dir:
            save_dir = Path(save_dir)
            save_dir.mkdir(parents=True, exist_ok=True)
            base_name = Path(image_path).stem

            # call existing visualization code
            self.save_visualizations(
                original_img, mask_full, age_data['ring_positions_pixels'],
                morpho['centroid'], age_data['radial_profile'],
                image_path, save_dir
            )

            overlay_path = save_dir / f"{base_name}_overlay.png"
            profile_path = save_dir / f"{base_name}_profile.png"

        result = {
            "image_path": str(image_path),
            "filename": Path(image_path).name,
            "species": {
                "name": species_name,
                "confidence": float(confidence)
            },
            "age": {
               "estimated_age_years": int(age_data['estimated_age_years']),
                "ring_count": int(age_data['ring_count']),
                "confidence": float(age_data['confidence']),
                "ring_positions_pixels": age_data["ring_positions_pixels"],
                "radial_profile": age_data["radial_profile"],
            },
            "morphometrics": morpho,
        }

        if overlay_path and profile_path:
            result["output_files"] = {
                "overlay": str(overlay_path),
                "profile": str(profile_path),
            }

        return result

    def compute_morphometrics(self, mask: np.ndarray) -> Dict:
        """Extract morphometric measurements."""
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) == 0:
            return {"error": "No otolith detected"}
        
        contour = max(contours, key=cv2.contourArea)
        
        area_px = cv2.contourArea(contour)
        perimeter_px = cv2.arcLength(contour, True)
        
        if len(contour) >= 5:
            ellipse = cv2.fitEllipse(contour)
            (cx, cy), (MA, ma), angle = ellipse
        else:
            M = cv2.moments(contour)
            cx = int(M['m10'] / M['m00']) if M['m00'] != 0 else 0
            cy = int(M['m01'] / M['m00']) if M['m00'] != 0 else 0
            MA, ma, angle = 0, 0, 0
        
        area_mm2 = area_px / (self.scale_factor ** 2) if self.scale_factor > 0 else area_px
        perimeter_mm = perimeter_px / self.scale_factor if self.scale_factor > 0 else perimeter_px
        circularity = 4 * np.pi * area_px / (perimeter_px ** 2) if perimeter_px > 0 else 0
        aspect_ratio = MA / ma if ma > 0 else 1.0
        
        return {
            "area_mm2": float(area_mm2),
            "perimeter_mm": float(perimeter_mm),
            "aspect_ratio": float(aspect_ratio),
            "circularity": float(circularity),
            "length_mm": float(MA / self.scale_factor) if self.scale_factor > 0 else float(MA),
            "width_mm": float(ma / self.scale_factor) if self.scale_factor > 0 else float(ma),
            "centroid": (int(cx), int(cy))
        }
    
    
    def detect_rings_radial(self, image: np.ndarray, mask: np.ndarray, 
                           centroid: Tuple[int, int]) -> Dict:
        """Detect growth rings using radial profile method."""
        cx, cy = centroid
        h, w = image.shape[:2]
        
        angles = np.linspace(0, 2*np.pi, 72, endpoint=False)
        max_radius = int(min(cx, cy, w-cx, h-cy, np.sqrt(np.sum(mask))))
        
        if max_radius < 10:
            return {
                "estimated_age_years": 0,
                "ring_count": 0,
                "ring_positions_pixels": [],
                "radial_profile": [],
                "confidence": 0.0
            }
        
        radii = np.arange(0, max_radius)
        intensities = []
        
        for angle in angles:
            x_coords = np.clip((cx + radii * np.cos(angle)).astype(int), 0, w-1)
            y_coords = np.clip((cy + radii * np.sin(angle)).astype(int), 0, h-1)
            valid = mask[y_coords, x_coords]
            intensity = image[y_coords, x_coords] * valid
            intensities.append(intensity)
        
        radial_profile = np.mean(intensities, axis=0)
        smoothed = gaussian_filter1d(radial_profile, sigma=3.5)
        
        peaks, properties = find_peaks(
            smoothed,
            distance=6,
            prominence=0.04,
            height=np.mean(smoothed) * 0.4,
            width=(2, None)
        )
        
        properties['peak_positions'] = peaks
        ring_count = len(peaks)
        confidence = self.compute_age_confidence(properties, ring_count)
        
        return {
            "estimated_age_years": int(ring_count),
            "ring_count": int(ring_count),
            "ring_positions_pixels": peaks.tolist(),
            "radial_profile": smoothed.tolist(),
            "confidence": float(confidence)
        }
    
    
    def compute_age_confidence(self, peak_properties: Dict, ring_count: int) -> float:
        """Compute confidence score for age determination."""
        if ring_count == 0:
            return 0.0
        
        prominences = peak_properties.get('prominences', [])
        widths = peak_properties.get('widths', [])
        
        if len(prominences) == 0:
            return 0.0
        
        mean_prominence = np.mean(prominences)
        prominence_score = min(mean_prominence * 8.0, 1.0)
        
        if len(prominences) > 1:
            peak_positions = peak_properties.get('peak_positions', [])
            spacing_std = np.std(np.diff(peak_positions))
            mean_spacing = np.mean(np.diff(peak_positions))
            regularity_score = 1.0 - min(spacing_std / (mean_spacing + 1e-6), 1.0)
        else:
            regularity_score = 0.5
        
        if 2 <= ring_count <= 20:
            count_score = 1.0
        elif ring_count == 1:
            count_score = 0.4
        else:
            count_score = max(0.2, 1.0 - abs(ring_count - 10) / 20)
        
        if len(widths) > 1:
            width_consistency = 1.0 - min(np.std(widths) / (np.mean(widths) + 1e-6), 1.0)
        else:
            width_consistency = 0.5
        
        confidence = (
            0.4 * prominence_score +
            0.3 * regularity_score +
            0.2 * count_score +
            0.1 * width_consistency
        )
        
        return float(min(confidence, 1.0))
    
    
    def save_visualizations(self, image, mask, ring_positions, centroid, 
                          radial_profile, image_path, save_dir):
        """Save overlay and profile images."""
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)
        
        base_name = Path(image_path).stem
        
        # Create overlay
        h, w = image.shape[:2]
        overlay = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        
        # Draw contour
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(overlay, contours, -1, (0, 255, 0), 4)
        
        # Draw centroid
        cv2.circle(overlay, centroid, 10, (0, 0, 255), -1)
        cv2.circle(overlay, centroid, 12, (255, 255, 255), 2)
        
        # Draw rings
        if len(ring_positions) > 0:
            for idx, radius in enumerate(ring_positions):
                color = (255, 150, 0) if idx % 2 == 0 else (200, 100, 0)
                thickness = 3 if idx % 2 == 0 else 2
                cv2.circle(overlay, centroid, int(radius), color, thickness)
            
            for idx, radius in enumerate(ring_positions):
                label_x = centroid[0] + int(radius * 0.707)
                label_y = centroid[1] - int(radius * 0.707)
                label_x = max(20, min(label_x, w - 50))
                label_y = max(30, min(label_y, h - 20))
                label_text = f"{idx + 1}"
                
                (text_w, text_h), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                cv2.rectangle(overlay, 
                             (label_x - 5, label_y - text_h - 5),
                             (label_x + text_w + 5, label_y + 5),
                             (255, 255, 255), -1)
                cv2.rectangle(overlay, 
                             (label_x - 5, label_y - text_h - 5),
                             (label_x + text_w + 5, label_y + 5),
                             (0, 0, 0), 2)
                cv2.putText(overlay, label_text, (label_x, label_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        # Info box
        info_text = f"Rings: {len(ring_positions)}"
        cv2.rectangle(overlay, (10, 10), (200, 50), (255, 255, 255), -1)
        cv2.rectangle(overlay, (10, 10), (200, 50), (0, 0, 0), 2)
        cv2.putText(overlay, info_text, (20, 35),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
        
        # Save overlay
        overlay_path = save_dir / f"{base_name}_overlay.png"
        cv2.imwrite(str(overlay_path), overlay)
        
        # Save radial profile
        fig, ax = plt.subplots(figsize=(12, 6), facecolor='white')
        radii = np.arange(len(radial_profile))
        ax.plot(radii, radial_profile, 'b-', linewidth=3, label='Smoothed Intensity Profile')
        
        if len(ring_positions) > 0:
            peak_intensities = [radial_profile[int(p)] for p in ring_positions]
            ax.scatter(ring_positions, peak_intensities, color='red', marker='x', 
                      s=300, linewidths=4, label=f'Detected Rings ({len(ring_positions)})')
            
            for idx, (pos, intensity) in enumerate(zip(ring_positions, peak_intensities)):
                ax.annotate(f'Ring {idx+1}', xy=(pos, intensity), xytext=(pos, intensity + 8),
                           fontsize=11, ha='center', fontweight='bold',
                           bbox=dict(boxstyle='round,pad=0.5', facecolor='yellow', 
                                    edgecolor='black', linewidth=2, alpha=0.9))
        
        ax.set_xlabel('Radius (pixels)', fontsize=14, fontweight='bold')
        ax.set_ylabel('Normalized Intensity', fontsize=14, fontweight='bold')
        ax.set_title('Radial Profile Analysis', fontsize=16, fontweight='bold', pad=20)
        ax.legend(fontsize=12, loc='upper right', framealpha=0.9)
        ax.grid(True, alpha=0.3, linestyle='--', linewidth=1)
        ax.set_facecolor('#f8f9fa')
        
        profile_path = save_dir / f"{base_name}_profile.png"
        plt.savefig(str(profile_path), dpi=150, bbox_inches='tight')
        plt.close(fig)
    
    
    def batch_analyze(self, image_dir: str, output_dir: str):
        """Analyze all images in directory."""
        image_dir = Path(image_dir)
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Find all image files
        image_files = list(image_dir.glob("*.jpg")) + list(image_dir.glob("*.png"))
        
        print(f"\n{'='*80}")
        print(f"BATCH OTOLITH ANALYSIS")
        print(f"{'='*80}")
        print(f"\n📁 Input: {image_dir}")
        print(f"📁 Output: {output_dir}")
        print(f"🔬 Processing {len(image_files)} images...\n")
        
        all_results = []
        
        # Process with progress bar
        for img_path in tqdm(image_files, desc="Analyzing", unit="image"):
            try:
                result = self.analyze_single(str(img_path), save_dir=str(output_dir))
                all_results.append(result)
            except Exception as e:
                print(f"\n❌ Error processing {img_path.name}: {e}")
                all_results.append({
                    "filename": img_path.name,
                    "error": str(e)
                })
        
        # Save summary JSON
        summary_path = output_dir / "analysis_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(all_results, f, indent=2)
        
        # Save summary CSV
        df = pd.DataFrame([
            {
                "filename": r['filename'],
                "species": r.get('species', {}).get('name', 'ERROR'),
                "species_confidence": r.get('species', {}).get('confidence', 0),
                "age_years": r.get('age', {}).get('estimated_age_years', 0),
                "age_confidence": r.get('age', {}).get('confidence', 0),
                "area_mm2": r.get('morphometrics', {}).get('area_mm2', 0),
                "length_mm": r.get('morphometrics', {}).get('length_mm', 0),
                "circularity": r.get('morphometrics', {}).get('circularity', 0)
            }
            for r in all_results
        ])
        csv_path = output_dir / "analysis_summary.csv"
        df.to_csv(csv_path, index=False)
        
        # Print summary
        print(f"\n{'='*80}")
        print("BATCH ANALYSIS COMPLETE")
        print(f"{'='*80}\n")
        print(f"✅ Successfully processed: {len([r for r in all_results if 'error' not in r])}/{len(image_files)}")
        print(f"❌ Failed: {len([r for r in all_results if 'error' in r])}")
        print(f"\n📄 Summary JSON: {summary_path}")
        print(f"📄 Summary CSV: {csv_path}")
        print(f"📁 Visualizations: {output_dir}/")
        
        return all_results


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    # Configuration
    base_dir = Path(__file__).parent
    
    species_map = {
        0: 'Lophiodes lugubris',
        1: 'Malthopsis lutea',
        2: 'Chaunax multilepis',
        3: 'Halieutaea coccinea',
        4: 'Chaunax apus'
    }
    
    # Initialize analyzer
    analyzer = BatchOtolithAnalyzer(
        model_path=str(base_dir / "experiments/oto_segnet_v1/checkpoints/best_model.pth"),
        species_map=species_map,
        scale_factor=10.0
    )
    
    # Run batch analysis
    results = analyzer.batch_analyze(
        image_dir=str(base_dir / "data/images"),
        output_dir=str(base_dir / "batch_results")
    )
