// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Customize the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize primary color
    },
    secondary: {
      main: '#dc004e', // Customize secondary color
    },
  },
  typography: {
    // Customize typography if needed
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:sessionId" element={<GameRoom />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default App;
