import React from "react";
import { useNavigate } from "react-router-dom";

const unauthorizedStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  fontFamily: 'Arial, sans-serif',
  background: 'linear-gradient(to right, #ff7e5f, #feb47b)', // Changed gradient colors
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

const buttonStylesUN = {
  padding: '15px 35px',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: '#ff5252', // Changed button color
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
  transition: 'background-color 0.2s ease-in-out',
};

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div style={unauthorizedStyles}>
      <h1 style={headingStyles}>403 - Unauthorized</h1>
      <p style={descriptionStyles}>
        You do not have permission to view this page. Please check the URL or contact an administrator if you believe this is an error.
      </p>
      <button style={buttonStylesUN} onClick={handleGoHome}>
        Click to Sign in Again
      </button>
    </div>
  );
};

export default Unauthorized;
