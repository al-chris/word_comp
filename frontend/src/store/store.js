// src/store/store.js
import React, { createContext, useReducer } from 'react';

const initialState = {
  user: null,
  session: null,
  story: '',
  players: [],
  notifications: [],
  currentTurn: null,
};

export const AppContext = createContext(initialState);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'UPDATE_STORY':
      return { ...state, story: action.payload };
    case 'UPDATE_PLAYERS':
      return { ...state, players: action.payload };
    case 'SET_CURRENT_TURN':
      return { ...state, currentTurn: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};
