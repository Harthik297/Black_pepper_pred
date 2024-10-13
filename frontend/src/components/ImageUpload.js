import React, { useState, useRef } from 'react';
import axios from 'axios';


const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // For showing the uploaded image preview
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [solution, setSolution] = useState(null); // State to hold the solution
  const [dragActive, setDragActive] = useState(false); // State for drag-and-drop

  const inputRef = useRef(null); // Reference to the hidden file input

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Check if a file is selected
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Create a preview for the uploaded image
    } else {
      setSelectedFile(null);
      setPreviewImage(null); // Reset preview if no file is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only proceed if a file has been selected
    if (!selectedFile) {
      console.warn("No file selected for upload.");
      return; // Exit if no file is selected
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setPrediction(response.data.class);
      setConfidence(response.data.confidence);
      setSolution(response.data.solution); // Set the solution from the response
    } catch (error) {
      console.error('Error uploading the image:', error);
    }
  };

  // Drag-and-Drop Handlers
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
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Create a preview for the uploaded image
    }
  };

  // Function to trigger the hidden file input click
  const handleClick = () => {
    inputRef.current.click();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <h2>Black Pepper Disease Classification</h2>

        {/* Drag and Drop area */}
        <div
          className={`upload-area ${dragActive ? 'active' : ''}`} // Conditionally apply 'active' class
          onClick={handleClick} // Trigger file input on click
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Show message when dragging */}
          {dragActive ? (
            <p>Drag the image here</p>
          ) : (
            <p>Drag and drop an image here, or click to select an image</p>
          )}
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            ref={inputRef} // Reference the input element
            style={{ display: 'none' }} // Make the file input invisible
          />
        </div>

        {/* Submit button */}
        <button type="submit" className="submit-button">Upload and Predict</button>
      </form>

      {previewImage && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {/* Displaying the original uploaded image */}
          <div className='Pre'>
            <h3 className='Preview'>Uploaded Image:</h3>
            <img src={previewImage} alt="Uploaded" style={{ width: '300px', border: '2px solid gray' }} />
          </div>

          {/* Displaying the result */}
          {prediction && (
            <div className='Res'>
              <h3 className='Result'>Prediction Result:</h3>
              <p><strong>Class:</strong> </p>
              <p>{prediction}</p>
              <p><strong>Confidence:</strong></p>
              <p>{confidence}</p>
              {/* Displaying the solution */}
              {solution && (
  <div>
    <p><strong>Possible Solution:</strong></p>
    <ul className='Points'>
      {solution.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
