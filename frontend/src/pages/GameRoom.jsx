// src/pages/GameRoom.jsx
import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';
import StoryDisplay from '../components/StoryDisplay';
import PlayerList from '../components/PlayerList';
import TypingInterface from '../components/TypingInterface';
import { toast } from 'react-toastify';

const GameRoom = () => {
  const { sessionId } = useParams();
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    socket.emit('join_session_event', { session_id: parseInt(sessionId) });

    socket.on('story_update', (data) => {
      dispatch({ type: 'UPDATE_STORY', payload: data.content });
    });

    socket.on('update_players', (data) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: data.players });
    });

    socket.on('turn_change', (data) => {
      dispatch({ type: 'SET_CURRENT_TURN', payload: data.user_id });
      toast.info(`It's now User ${data.user_id}'s turn`);
    });

    socket.on('player_joined', (data) => {
      toast.info(`User ${data.user_id} joined the session`);
    });

    socket.on('player_left', (data) => {
      toast.info(`User ${data.user_id} left the session`);
    });

    socket.on('session_ended', (data) => {
      toast.info('Session has ended');
    });

    return () => {
      socket.emit('leave_session_event', { session_id: parseInt(sessionId) });
      socket.off('story_update');
      socket.off('update_players');
      socket.off('turn_change');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('session_ended');
    };
  }, [sessionId, dispatch]);

  return (
    <div>
      <h2>Game Room: {sessionId}</h2>
      <StoryDisplay />
      <PlayerList />
      <TypingInterface />
    </div>
  );
};

export default GameRoom;
