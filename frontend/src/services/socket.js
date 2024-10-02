// src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';
console.log('auth: ' + localStorage.getItem('authToken'));

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  auth: {
    token: localStorage.getItem('authToken'),
  },
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  const token = localStorage.getItem('authToken');
  if (token) {
    socket.emit('authenticate', { token });
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

export default socket;
