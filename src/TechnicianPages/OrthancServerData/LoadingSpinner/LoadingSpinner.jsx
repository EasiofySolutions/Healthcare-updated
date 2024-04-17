import React from 'react';
import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="AutomateUpload-spinner-container">
  <div className="AutomateUpload-spinner"></div>
  <div className="AutomateUpload-loading-text">Please wait getting files ready for Upload...</div>
</div>

  );
};

export default LoadingSpinner;
