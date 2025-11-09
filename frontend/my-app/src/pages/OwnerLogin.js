import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        navigate('/home');
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
};

  return (
    <div className="form-container">
      <h2>Pet Owner Login</h2>
       {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit">Login</button>
      </form>
      <p>Don’t have an account? <span onClick={() => navigate('/owner-register')} className="link">Register</span></p>
      
    </div>
    
  );
}

export default OwnerLogin;
