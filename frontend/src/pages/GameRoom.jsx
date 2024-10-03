// src/pages/GameRoom.jsx

import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';
import StoryDisplay from '../components/StoryDisplay';
import PlayerList from '../components/PlayerList';
import TypingInterface from '../components/TypingInterface';
import { toast } from 'react-toastify';
import { Container, Grid, Typography, Box } from '@mui/material';

const GameRoom = () => {
  const { sessionId } = useParams();
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    socket.emit('join_session_event', { session_id: parseInt(sessionId) });

    const handleStoryUpdate = (data) => {
      dispatch({ type: 'UPDATE_STORY', payload: data.content });
    };

    const handleUpdatePlayers = (data) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: data.players });
    };

    const handleTurnChange = (data) => {
      dispatch({ type: 'SET_CURRENT_TURN', payload: data.user_id });
      toast.info(`It's now User ${data.user_id}'s turn`);
    };

    const handlePlayerJoined = (data) => {
      toast.info(`User ${data.user_id} joined the session`);
    };

    const handlePlayerLeft = (data) => {
      toast.info(`User ${data.user_id} left the session`);
    };

    const handleSessionEnded = (data) => {
      toast.info('Session has ended');
    };

    socket.on('story_update', handleStoryUpdate);
    socket.on('update_players', handleUpdatePlayers);
    socket.on('turn_change', handleTurnChange);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('session_ended', handleSessionEnded);

    return () => {
      socket.emit('leave_session_event', { session_id: parseInt(sessionId) });
      socket.off('story_update', handleStoryUpdate);
      socket.off('update_players', handleUpdatePlayers);
      socket.off('turn_change', handleTurnChange);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
      socket.off('session_ended', handleSessionEnded);
    };
  }, [sessionId, dispatch]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Game Room: {sessionId}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <StoryDisplay />
            <TypingInterface />
          </Grid>
          <Grid item xs={12} md={4}>
            <PlayerList />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default GameRoom;
