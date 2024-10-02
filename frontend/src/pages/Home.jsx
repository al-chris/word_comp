// src/pages/Home.jsx (Updated to include Register route)
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import UserSearch from '../components/UserSearch';
import SessionSearch from '../components/SessionSearch';
import Register from './Register';

const Home = () => {
  return (
    <div>
      <h1>Multiplayer Word Completion Game</h1>
      <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      <UserSearch />
      <SessionSearch />
    </div>
  );
};

export default Home;
