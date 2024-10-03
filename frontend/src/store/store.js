// src/store/store.js

import React, { createContext, useReducer } from 'react';

// Initial State
const initialState = {
  user: {
    id: null,
    name: '',
    token: '',
  },
  session: {
    id: null,
    title: '',
    isActive: false,
  },
  selectedUser: null,
  story: '',
  players: [],
  currentTurn: null,
};

// Create Context
export const AppContext = createContext(initialState);

// Reducer
export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          id: action.payload.id || null,
          name: action.payload.name || '',
          token: action.payload.token || '',
        },
      };
    case 'SET_SESSION':
      return {
        ...state,
        session: {
          id: action.payload.id || null,
          title: action.payload.title || '',
          isActive: action.payload.isActive || false,
        },
      };
    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUser: action.payload || null,
      };
    case 'UPDATE_STORY':
      return {
        ...state,
        story: action.payload || '',
      };
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.payload || [],
      };
    case 'SET_CURRENT_TURN':
      return {
        ...state,
        currentTurn: action.payload || null,
      };
    case 'RESET_SESSION':
      return {
        ...state,
        session: initialState.session,
        story: initialState.story,
        players: initialState.players,
        currentTurn: initialState.currentTurn,
      };
    default:
      return state;
  }
};

// Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
