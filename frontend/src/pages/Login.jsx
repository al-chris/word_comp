// src/pages/Login.jsx

import React, { useState, useContext } from 'react';
import { login } from '../services/api';
import { AppContext } from '../store/store';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

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
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Login
          </Button>
          <Typography variant="body2">
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
