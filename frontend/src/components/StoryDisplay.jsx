// src/components/StoryDisplay.jsx

import React, { useEffect, useContext } from 'react';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';
import { Typography, Box } from '@mui/material';

const StoryDisplay = () => {
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    const handleStoryUpdate = (data) => {
      dispatch({ type: 'UPDATE_STORY', payload: data.content });
    };

    socket.on('story_update', handleStoryUpdate);

    return () => {
      socket.off('story_update', handleStoryUpdate);
    };
  }, [dispatch]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Story
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {state.story}
      </Typography>
    </Box>
  );
};

export default StoryDisplay;
