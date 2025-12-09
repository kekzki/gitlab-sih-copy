import React, { useState } from "react";
import { Upload, X, Check, Loader } from "lucide-react"; // Added Loader icon
import { useAuth } from "../context/AuthContext";
import "./UploadDataset.css";

const UploadDataset = () => {
  const { session } = useAuth();
  const [currentView, setCurrentView] = useState("form"); // "form" or "success"
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // New state for loading

  // Environment variable for Docker/Prod support, defaults to localhost
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    authors: [session?.user?.user_metadata?.full_name || ""],
    dateOfCollection: "",
    keywords: "",
    description: "",
    isPublic: false,
  });

  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);

  // Generate IDs (Kept for UI display purposes)
  const generateSubmissionId = () => {
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `DS-${date}-${random}`;
  };

  const generateDOI = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `10.5194/ds-${random}`;
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    // Clear global submit error if user changes input
    if (errors.submit) {
      setErrors({ ...errors, submit: "" });
    }
  };

  const handleAuthorChange = (index, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = value;
    setFormData({ ...formData, authors: newAuthors });
    if (errors.authors) {
      setErrors({ ...errors, authors: "" });
    }
  };

  const addAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, ""],
    });
  };

  const removeAuthor = (index) => {
    if (formData.authors.length > 1) {
      const newAuthors = formData.authors.filter((_, i) => i !== index);
      setFormData({ ...formData, authors: newAuthors });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Dataset title is required";
    }

    if (
      !formData.authors.some((author) => author.trim()) ||
      formData.authors.every((author) => !author.trim())
    ) {
      newErrors.authors = "At least one author is required";
    }

    if (!formData.dateOfCollection) {
      newErrors.dateOfCollection = "Date of collection is required";
    }

    if (!selectedFile) {
      newErrors.file = "Please select a file to upload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit - UPDATED FOR BACKEND INTEGRATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setErrors({}); // Clear previous errors

    try {
      // 1. Prepare FormData for Go Backend
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      
      // Note: Currently the Go backend only reads 'file'. 
      // If you update Go to read metadata, you can append these fields:
      // uploadData.append("title", formData.title);
      // uploadData.append("description", formData.description);

      // 2. Send to Go Backend
      const response = await fetch(`${API_URL}/api/upload/smart`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      const result = await response.json();

      // 3. Prepare Success Data
      // We combine the frontend metadata with the backend result
      const submissionId = generateSubmissionId();
      const doi = generateDOI();

      const submission = {
        submissionId,
        doi,
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2),
        datasetTitle: formData.title,
        authors: formData.authors.filter((a) => a.trim()),
        collectionDate: formData.dateOfCollection,
        keywords: formData.keywords,
        description: formData.description,
        isPublic: formData.isPublic,
        uploadedAt: new Date().toLocaleDateString(),
        // Add backend info to the internal state if needed
        detectedTable: result.detected_table, 
        rowsProcessed: result.rows_processed
      };

      setSubmittedData(submission);
      setCurrentView("success");

    } catch (error) {
      console.error("Upload Error:", error);
      setErrors({ 
        submit: `Server Error: ${error.message}. Is the backend running?` 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle upload another dataset
  const handleUploadAnother = () => {
    setFormData({
      title: "",
      authors: [session?.user?.user_metadata?.full_name || ""],
      dateOfCollection: "",
      keywords: "",
      description: "",
      isPublic: false,
    });
    setSelectedFile(null);
    setErrors({});
    setCurrentView("form");
  };

  // Form View
  if (currentView === "form") {
    return (
      <div className="upload-dataset-container">
        <div className="upload-dataset-card">
          <h1 className="upload-title">Upload Marine Dataset</h1>
          <p className="upload-subtitle">
            Share your marine research data with the scientific community
          </p>

          <form onSubmit={handleSubmit} className="upload-form">
            
            {/* Global Error Message */}
            {errors.submit && (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                border: '1px solid #ef4444', 
                color: '#b91c1c', 
                padding: '10px', 
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '0.9rem'
              }}>
                {errors.submit}
              </div>
            )}

            {/* File Upload Section */}
            <div className="form-section">
              <h2 className="section-title">Step 1: Select File</h2>

              <div
                className={`drag-drop-area ${dragActive ? "active" : ""} ${
                  errors.file ? "error" : ""
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => window.fileInputRef?.click()}
                style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
              >
                {selectedFile ? (
                  <div className="file-selected">
                    <div className="file-icon">📄</div>
                    <div className="file-info">
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="remove-file-btn"
                        title="Remove file"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="drag-drop-content">
                    <Upload size={40} className="upload-icon" />
                    <p className="drag-text">
                      Drag and drop your file here, or click to select
                    </p>
                    <p className="drag-subtext">
                      Supported formats: CSV, JSON
                    </p>
                  </div>
                )}

                <input
                  ref={(input) => {
                    if (input) window.fileInputRef = input;
                  }}
                  type="file"
                  onChange={handleFileSelect}
                  className="file-input"
                  accept=".csv,.json"
                  disabled={isUploading}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {errors.file && <p className="error-message">{errors.file}</p>}
            </div>

            {/* Dataset Information Section */}
            <div className="form-section">
              <h2 className="section-title">Step 2: Dataset Information</h2>

              {/* Dataset Title */}
              <div className="form-group">
                <label htmlFor="title">
                  Dataset Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title for your dataset"
                  className={`form-input ${errors.title ? "error" : ""}`}
                  disabled={isUploading}
                />
                {errors.title && (
                  <p className="error-message">{errors.title}</p>
                )}
              </div>

              {/* Authors */}
              <div className="form-group">
                <label>
                  Author(s) <span className="required">*</span>
                </label>
                <div className="authors-list">
                  {formData.authors.map((author, index) => (
                    <div key={index} className="author-input-group">
                      <input
                        type="text"
                        value={author}
                        onChange={(e) =>
                          handleAuthorChange(index, e.target.value)
                        }
                        placeholder="Author name"
                        className="form-input"
                        disabled={isUploading}
                      />
                      {formData.authors.length > 1 && !isUploading && (
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="remove-author-btn"
                          title="Remove author"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addAuthor}
                  className="add-author-btn"
                  disabled={isUploading}
                >
                  + Add Author
                </button>
                {errors.authors && (
                  <p className="error-message">{errors.authors}</p>
                )}
              </div>

              {/* Date of Collection */}
              <div className="form-group">
                <label htmlFor="dateOfCollection">
                  Date of Collection <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfCollection"
                  name="dateOfCollection"
                  value={formData.dateOfCollection}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.dateOfCollection ? "error" : ""
                  }`}
                  disabled={isUploading}
                />
                {errors.dateOfCollection && (
                  <p className="error-message">{errors.dateOfCollection}</p>
                )}
              </div>

              {/* Keywords */}
              <div className="form-group">
                <label htmlFor="keywords">Keywords</label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="e.g., marine, biodiversity, ocean (comma separated)"
                  className="form-input"
                  disabled={isUploading}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of your dataset"
                  className="form-textarea"
                  rows="5"
                  disabled={isUploading}
                />
              </div>

              {/* Share Publicly Checkbox */}
              <div className="checkbox-group">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    disabled={isUploading}
                  />
                  <label htmlFor="isPublic">Share this dataset publicly</label>
                </div>
                <p className="checkbox-hint">
                  If unchecked, your dataset will remain private and visible
                  only to you.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isUploading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isUploading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing Upload...
                </>
              ) : (
                "Submit Dataset"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Success View (Unchanged logic, just renders the submittedData)
  if (currentView === "success" && submittedData) {
    return (
      <div className="upload-dataset-container">
        <div className="success-card">
          <div className="success-header">
            <div className="success-icon">
              <Check size={40} />
            </div>
            <h1 className="success-title">Submission Successful!</h1>
            <p className="success-subtitle">
              Your dataset has been submitted to ParadoxX6
            </p>
          </div>

          <div className="submission-details">
            <div className="details-grid">
              {/* File Information */}
              <div className="detail-section">
                <h3 className="detail-header">File Information</h3>
                <div className="detail-row">
                  <span className="detail-label">File Name:</span>
                  <span className="detail-value">{submittedData.fileName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">File Size:</span>
                  <span className="detail-value">
                    {submittedData.fileSize} MB
                  </span>
                </div>
                {/* Optional: Show Backend Stats if available */}
                {submittedData.detectedTable && (
                  <div className="detail-row">
                    <span className="detail-label">Detected Type:</span>
                    <span className="detail-value" style={{color: 'green'}}>
                      {submittedData.detectedTable}
                    </span>
                  </div>
                )}
              </div>

              {/* Dataset Information */}
              <div className="detail-section">
                <h3 className="detail-header">Dataset Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">
                    {submittedData.datasetTitle}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Authors:</span>
                  <span className="detail-value">
                    {submittedData.authors.join(", ")}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Collection Date:</span>
                  <span className="detail-value">
                    {submittedData.collectionDate}
                  </span>
                </div>
              </div>

              {/* Submission Information */}
              <div className="detail-section">
                <h3 className="detail-header">Submission Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Submission ID:</span>
                  <span className="detail-value submission-id">
                    {submittedData.submissionId}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DOI:</span>
                  <span className="detail-value doi">{submittedData.doi}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Uploaded:</span>
                  <span className="detail-value">
                    {submittedData.uploadedAt}
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              {(submittedData.keywords ||
                submittedData.description ||
                submittedData.isPublic) && (
                <div className="detail-section">
                  <h3 className="detail-header">Additional Information</h3>
                  {submittedData.keywords && (
                    <div className="detail-row">
                      <span className="detail-label">Keywords:</span>
                      <span className="detail-value">
                        {submittedData.keywords}
                      </span>
                    </div>
                  )}
                  {submittedData.description && (
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value description">
                        {submittedData.description}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Visibility:</span>
                    <span
                      className={`detail-value ${
                        submittedData.isPublic ? "public" : "private"
                      }`}
                    >
                      {submittedData.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleUploadAnother} className="upload-another-btn">
            Upload Another Dataset
          </button>
        </div>
      </div>
    );
  }
};

export default UploadDataset;
