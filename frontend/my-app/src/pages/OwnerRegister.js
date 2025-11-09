import React, { useState } from 'react';
import { API_URL } from '../api';
function OwnerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    pet: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };

  return (
    <div className="form-container">
      <h2>Pet Owner Registration</h2>
        {message && <p>{message}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
        <input type="text" name="pet" placeholder="Pet Name" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Create Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default OwnerRegister;
