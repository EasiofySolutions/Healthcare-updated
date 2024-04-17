import React from 'react';

import { Link } from 'react-router-dom';

const errorPageStyles = {
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

const buttonStyles = {
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

const ErrorPage = () => {
  return (
    <div style={errorPageStyles}>
      <h1 style={headingStyles}>Oops! Error</h1>
      <p style={descriptionStyles}>
        Unable to fetch the data from the Orthanc Server. Please ensure the proxy server is running.
      </p>
      <Link to="/Technician">
        <button style={buttonStyles}>Go Back</button>
      </Link>
    </div>
  );
};

export default ErrorPage;
