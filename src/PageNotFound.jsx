import React from "react";
import { useNavigate } from "react-router-dom";

const pageNotFoundStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(to right, #fbc2eb, #a6c1ee)',
  };
  
  const headingStyles = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    marginBottom: '20px',
  };
  
  const descriptionStyles = {
    fontSize: '24px',
    color: '#fff',
    textAlign: 'center',
    maxWidth: '600px',
    marginBottom: '30px',
  };
  
  const buttonStylesPNF = {
    padding: '15px 35px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#ff4081',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'background-color 0.2s ease-in-out',
  };
  
  const PageNotFound = () => {
    const navigate = useNavigate();
  
    const handleGoBack = () => {
      navigate(-1);
    };
  
    return (
      <div style={pageNotFoundStyles}>
        <h1 style={headingStyles}>Oops! Page Not Found</h1>
        <p style={descriptionStyles}>
          The page you are looking for does not exist or may have been moved.
        </p>
        <button style={buttonStylesPNF} onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    );
  };

  export default PageNotFound;