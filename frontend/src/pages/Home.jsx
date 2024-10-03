// src/pages/Home.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import UserSearch from '../components/UserSearch';
import SessionSearch from '../components/SessionSearch';
import { Container, Typography, Button, Box } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Multiplayer Word Completion Game
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/login" variant="contained" sx={{ mr: 2 }}>
            Login
          </Button>
          <Button component={Link} to="/register" variant="outlined">
            Register
          </Button>
        </Box>
      </Box>
      <Box sx={{ mt: 4 }}>
        <UserSearch />
      </Box>
      <Box sx={{ mt: 4 }}>
        <SessionSearch />
      </Box>
    </Container>
  );
};

export default Home;
