import React from 'react';
import './Navbar.css';

function Navbar() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <nav className="navbar">
      <h1 className="navbar-heading">VIDHISHA DASHBOARD</h1>
      <div className="navbar-date">{today}</div>
    </nav>
  );
}

export default Navbar;
