"""
models/oto_segnet.py - Oto-SegNet: U-Net with ResNet-50 for multi-task learning
"""

import torch
import torch.nn as nn
import segmentation_models_pytorch as smp
from typing import Tuple

class OtoSegNet(nn.Module):
    """
    Hybrid U-Net architecture for otolith analysis.
    
    Features:
    - ResNet-50 encoder (proven for biomedical imaging)
    - Multi-task learning (segmentation + classification)
    - Handles grayscale images (1 channel)
    - Produces binary masks + species predictions
    """
    
    def __init__(
        self,
        num_species: int = 5,
        encoder_weights: str = 'imagenet',
        encoder_name: str = 'resnet50',
        in_channels: int = 1,
        activation: str = None
    ):
        """
        Args:
            num_species: Number of fish species classes
            encoder_weights: 'imagenet' for pretrained, None for random init
            encoder_name: Encoder backbone ('resnet50', 'resnet34', 'efficientnet-b3')
            in_channels: 1 for grayscale, 3 for RGB
            activation: Output activation ('sigmoid', 'softmax', None)
        """
        super(OtoSegNet, self).__init__()
        
        self.num_species = num_species
        self.encoder_name = encoder_name
        
        # IMPORTANT: For grayscale images, we need to modify the first conv layer
        # segmentation_models_pytorch expects 3 channels by default
        self.unet = smp.Unet(
            encoder_name=encoder_name,
            encoder_weights=encoder_weights,
            in_channels=in_channels,
            classes=1,  # Binary segmentation
            activation=activation
        )
        
        # Get encoder output channels
        encoder_channels = {
            'resnet50': 2048,
            'resnet34': 512,
            'efficientnet-b3': 1536,
            'resnet18': 512
        }
        
        bottleneck_channels = encoder_channels.get(encoder_name, 2048)
        
        # Classification head (uses encoder bottleneck features)
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(bottleneck_channels, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(256),
            nn.Dropout(0.2),
            nn.Linear(256, num_species)
        )
        
        # Hook to capture encoder bottleneck features
        self.bottleneck_features = None
        self._register_hook()
    
    def _register_hook(self):
        """Register forward hook to capture bottleneck features."""
        def hook_fn(module, input, output):
            self.bottleneck_features = output
        
        # Register hook on the last encoder layer
        # For ResNet-50, this is layer4
        if hasattr(self.unet.encoder, 'layer4'):
            self.unet.encoder.layer4.register_forward_hook(hook_fn)
        elif hasattr(self.unet.encoder, 'blocks'):
            # For EfficientNet
            self.unet.encoder.blocks[-1].register_forward_hook(hook_fn)
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward pass with multi-task outputs.
        
        Args:
            x: Input tensor (B, C, H, W) where C=1 for grayscale
        
        Returns:
            segmentation: (B, 1, H, W) - logits for binary mask
            species_logits: (B, num_species) - logits for classification
        """
        # Segmentation branch (standard U-Net forward)
        segmentation = self.unet(x)
        
        # Classification branch (uses captured bottleneck features)
        if self.bottleneck_features is None:
            raise RuntimeError("Bottleneck features not captured. Check hook registration.")
        
        species_logits = self.classifier(self.bottleneck_features)
        
        return segmentation, species_logits
    
    def predict_segmentation(self, x: torch.Tensor) -> torch.Tensor:
        """Predict binary mask only (inference)."""
        segmentation, _ = self.forward(x)
        return torch.sigmoid(segmentation)
    
    def predict_species(self, x: torch.Tensor) -> torch.Tensor:
        """Predict species probabilities only (inference)."""
        _, species_logits = self.forward(x)
        return torch.softmax(species_logits, dim=1)
    
    def freeze_encoder(self):
        """Freeze encoder weights (for fine-tuning classifier only)."""
        for param in self.unet.encoder.parameters():
            param.requires_grad = False
    
    def unfreeze_encoder(self):
        """Unfreeze encoder for full training."""
        for param in self.unet.encoder.parameters():
            param.requires_grad = True


# ============================================================================
# LIGHTWEIGHT ALTERNATIVES
# ============================================================================

class OtoSegNetLite(nn.Module):
    """
    Lighter version with ResNet-34 or ResNet-18 encoder.
    """
    
    def __init__(self, num_species: int = 5, encoder_name: str = 'resnet34'):
        super(OtoSegNetLite, self).__init__()
        
        self.unet = smp.Unet(
            encoder_name=encoder_name,
            encoder_weights='imagenet',
            in_channels=1,
            classes=1,
            activation=None
        )
        
        bottleneck = 512 if encoder_name in ['resnet34', 'resnet18'] else 2048
        
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(bottleneck, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_species)
        )
        
        self.bottleneck_features = None
        self._register_hook()
    
    def _register_hook(self):
        """Register hook on encoder bottleneck."""
        def hook_fn(module, input, output):
            self.bottleneck_features = output
        
        if hasattr(self.unet.encoder, 'layer4'):
            self.unet.encoder.layer4.register_forward_hook(hook_fn)
    
    def forward(self, x):
        segmentation = self.unet(x)
        species_logits = self.classifier(self.bottleneck_features)
        return segmentation, species_logits


# ============================================================================
# MODEL FACTORY
# ============================================================================

def create_oto_segnet(
    model_type: str = 'full',
    num_species: int = 5,
    encoder_weights: str = 'imagenet'
) -> nn.Module:
    """
    Factory function to create Oto-SegNet variants.
    
    Args:
        model_type: 'full' (ResNet-50), 'lite' (ResNet-34), 'tiny' (ResNet-18)
        num_species: Number of species classes
        encoder_weights: 'imagenet' or None
    
    Returns:
        OtoSegNet model instance
    """
    if model_type == 'full':
        return OtoSegNet(num_species=num_species, encoder_name='resnet50', 
                        encoder_weights=encoder_weights)
    elif model_type == 'lite':
        return OtoSegNetLite(num_species=num_species, encoder_name='resnet34')
    elif model_type == 'tiny':
        return OtoSegNetLite(num_species=num_species, encoder_name='resnet18')
    else:
        raise ValueError(f"Unknown model type: {model_type}")


# ============================================================================
# TESTING
# ============================================================================

if __name__ == "__main__":
    print("="*80)
    print("Testing Oto-SegNet Architecture")
    print("="*80)
    
    # Create model
    model = create_oto_segnet(model_type='full', num_species=5)
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    print(f"\n📊 Model Statistics:")
    print(f"  Total parameters: {total_params:,}")
    print(f"  Trainable parameters: {trainable_params:,}")
    print(f"  Model size: ~{total_params * 4 / (1024**2):.1f} MB (float32)")
    
    # Test forward pass
    batch_size = 4
    dummy_input = torch.randn(batch_size, 1, 256, 256)
    
    print(f"\n🔄 Testing forward pass:")
    print(f"  Input shape: {dummy_input.shape}")
    
    model.eval()
    with torch.no_grad():
        segmentation, species_logits = model(dummy_input)
    
    print(f"  Segmentation output: {segmentation.shape}")
    print(f"  Species logits: {species_logits.shape}")
    
    # Test inference methods
    mask_pred = model.predict_segmentation(dummy_input)
    species_probs = model.predict_species(dummy_input)
    
    print(f"\n✅ Inference outputs:")
    print(f"  Predicted mask: {mask_pred.shape} (values in [0, 1])")
    print(f"  Species probabilities: {species_probs.shape}")
    print(f"  Sample probabilities: {species_probs[0].detach().numpy()}")  # FIXED: Added .detach()
    print(f"  Sum of probabilities: {species_probs[0].sum().item():.4f} (should be ~1.0)")
    
    # Test different model sizes
    print(f"\n📏 Testing model variants:")
    for variant in ['full', 'lite', 'tiny']:
        model_var = create_oto_segnet(model_type=variant, num_species=5)
        params = sum(p.numel() for p in model_var.parameters())
        print(f"  {variant.upper()}: {params:,} parameters (~{params * 4 / (1024**2):.1f} MB)")
    
    print("\n" + "="*80)
    print("✅ Model architecture validated successfully!")
    print("="*80)