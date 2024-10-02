// src/components/StoryDisplay.jsx
import React, { useEffect, useContext } from 'react';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';

const StoryDisplay = () => {
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    socket.on('story_update', (data) => {
      dispatch({ type: 'UPDATE_STORY', payload: data.content });
    });

    return () => {
      socket.off('story_update');
    };
  }, [dispatch]);

  return (
    <div>
      <h3>Story</h3>
      <p>{state.story}</p>
    </div>
  );
};

export default StoryDisplay;
