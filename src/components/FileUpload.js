import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ setUploadedFile }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post('http://localhost:11000/api/upload', formData);
      setMessage(response.data.message);
      setUploadedFile(response.data.file); // <-- send filename to App
    } catch (err) {
      console.error(err);
      setMessage('Error uploading file');
    }
  };

  return (
    <div>
      <h2>Upload a PDF File</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default FileUpload;
