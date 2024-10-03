// Example: TypingInterface.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';
import { toast } from 'react-toastify';
import { TextField, Button, Box, Typography } from '@mui/material';

const TypingInterface = () => {
  const { state } = useContext(AppContext);
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!state.session || !state.session.id) {
      toast.error('Session not found');
      return;
    }
    if (!state.user || !state.user.id) {
      toast.error('User not found');
      return;
    }
    if (content.trim() === '') {
      toast.error('Content cannot be empty');
      return;
    }
    socket.emit('submit_content', { session_id: state.session.id, content });
    setContent('');
  };

  const handlePause = () => {
    if (!state.session || !state.session.id) {
      toast.error('Session not found');
      return;
    }
    socket.emit('pause', { session_id: state.session.id });
    toast.info('You have paused');
  };

  const handleResume = () => {
    if (!state.session || !state.session.id) {
      toast.error('Session not found');
      return;
    }
    socket.emit('resume', { session_id: state.session.id });
    toast.info('You have resumed');
  };

  useEffect(() => {
    if (state.currentTurn === state.user.id && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state.currentTurn, state.user.id]);

  if (!state.session || !state.user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      {state.currentTurn === state.user.id ? (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            inputRef={textareaRef}
            label="Your Contribution"
            multiline
            rows={4}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handlePause} fullWidth>
              Pause
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleResume} fullWidth>
              Resume
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="h6" align="center">
          Waiting for your turn...
        </Typography>
      )}
    </Box>
  );
};

export default TypingInterface;
