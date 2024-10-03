// src/components/UserSearch.jsx

import React, { useState, useEffect, useContext } from 'react';
import { searchUsers } from '../services/api';
import { AppContext } from '../store/store';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
} from '@mui/material';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { state, dispatch } = useContext(AppContext);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() === '') {
      toast.error('Please enter a search query');
      return;
    }
    try {
      const res = await searchUsers(query);
      setResults(res.data);
    } catch (error) {
      toast.error('Failed to search users');
      console.error(error);
    }
  };

  const handleSelectUser = (user) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
    toast.success(`Selected User: ${user.name}`);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Search Users
        </Typography>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <TextField
                fullWidth
                label="Search by username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: '100%' }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: 4 }}>
          <List>
            {results.length > 0 ? (
              results.map((user) => (
                <ListItem
                  key={user.id}
                  button
                  onClick={() => handleSelectUser(user)}
                >
                  <ListItemText primary={user.name} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body1" align="center">
                No users found
              </Typography>
            )}
          </List>
        </Box>
      </Box>
    </Container>
  );
};

export default UserSearch;
