// src/pages/SessionSearch.jsx

import React, { useEffect, useState, useContext } from 'react';
import { searchSessions, createSession, joinSession } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../store/store';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';

const SessionSearch = () => {
  const [sessions, setSessions] = useState([]);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useContext(AppContext);

  const fetchSessions = async () => {
    try {
      const res = await searchSessions();
      setSessions(res.data);
    } catch (error) {
      toast.error('Failed to fetch sessions');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createSession({ title });
      dispatch({ type: 'SET_SESSION', payload: res.data });
      toast.success('Session created successfully');
      navigate(`/game/${res.data.id}`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized. Please log in again.');
      } else if (error.response && error.response.status === 422) {
        toast.error('Invalid data. Please check your input.');
      } else {
        toast.error('Failed to create session');
      }
      console.error(error);
    }
  };

  const handleJoin = async (sessionId) => {
    try {
      const res = await joinSession(sessionId);
      dispatch({ type: 'SET_SESSION', payload: { id: sessionId } });
      toast.success('Joined session successfully');
      navigate(`/game/${sessionId}`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized. Please log in again.');
      } else if (error.response && error.response.status === 422) {
        toast.error('Invalid data. Please check your input.');
      } else {
        toast.error('Failed to join session');
      }
      console.error(error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Active Sessions
        </Typography>
        <List>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              secondaryAction={
                <Button variant="contained" onClick={() => handleJoin(session.id)}>
                  Join
                </Button>
              }
            >
              <ListItemText primary={session.title} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Session
        </Typography>
        <Box component="form" onSubmit={handleCreate}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Session Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button type="submit" variant="contained" fullWidth>
                Create
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default SessionSearch;
