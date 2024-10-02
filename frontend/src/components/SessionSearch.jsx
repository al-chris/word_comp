// src/pages/SessionSearch.jsx

import React, { useEffect, useState, useContext } from 'react';
import { searchSessions, createSession, joinSession } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../store/store';
import { toast } from 'react-toastify';

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
      await joinSession(sessionId);
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
    <div>
      <h3>Active Sessions</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            {session.title} -{' '}
            <button onClick={() => handleJoin(session.id)}>Join</button>
          </li>
        ))}
      </ul>
      <h3>Create New Session</h3>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Session Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default SessionSearch;
