// src/components/PlayerList.jsx

import React, { useEffect, useContext } from 'react';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';
import { List, ListItem, ListItemText, Typography, Box, Chip } from '@mui/material';

const PlayerList = () => {
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    const handleUpdatePlayers = (data) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: data.players });
    };

    socket.on('update_players', handleUpdatePlayers);

    return () => {
      socket.off('update_players', handleUpdatePlayers);
    };
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Players
      </Typography>
      <List>
        {state.players.map((player) => (
          <ListItem key={player.user_id} disablePadding>
            <ListItemText primary={`User ${player.user_id}`} />
            {player.is_paused ? (
              <Chip label="Paused" color="warning" size="small" />
            ) : player.is_active ? (
              <Chip label="Active" color="success" size="small" />
            ) : (
              <Chip label="Inactive" color="default" size="small" />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PlayerList;
