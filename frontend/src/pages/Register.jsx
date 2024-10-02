// src/pages/Register.jsx

import React, { useState, useContext } from 'react';
import { register } from '../services/api';
import { AppContext } from '../store/store';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { dispatch } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register({ name, password });
      localStorage.setItem('authToken', res.data.access_token);
      dispatch({ type: 'SET_USER', payload: { name, token: res.data.access_token } });
      toast.success('Registered successfully');
      navigate('/');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized. Please try again.');
      } else {
        toast.error('Registration failed');
      }
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
