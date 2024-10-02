// src/components/TypingInterface.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';
import { toast } from 'react-toastify';

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

  if (!state.session) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {state.currentTurn === state.user.id && (
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            placeholder="Your contribution..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
          <button type="submit">Submit</button>
        </form>
      )}
      {state.currentTurn === state.user.id && (
        <div>
          <button onClick={handlePause}>Pause</button>
          <button onClick={handleResume}>Resume</button>
        </div>
      )}
    </div>
  );
};

export default TypingInterface;
