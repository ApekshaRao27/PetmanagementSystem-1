import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome to Pet Management System</h1>
      <div className="button-container">
        <button onClick={() => navigate('/doctor-login')}>Doctor / Admin</button>
        <button onClick={() => navigate('/owner-login')}>Pet Owner</button>
      </div>
    </div>
  );
}

export default HomePage;
