// src/pages/Login.jsx

import React, { useState, useContext } from 'react';
import { login } from '../services/api';
import { AppContext } from '../store/store';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { dispatch } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ name, password });
      localStorage.setItem('authToken', res.data.access_token);
      dispatch({ type: 'SET_USER', payload: { name, token: res.data.access_token } });
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Invalid credentials. Please try again.');
      } else {
        toast.error('Login failed');
      }
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
