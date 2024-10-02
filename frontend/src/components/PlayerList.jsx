// src/components/PlayerList.jsx
import React, { useEffect, useContext } from 'react';
import { AppContext } from '../store/store';
import { socket } from '../services/socket';

const PlayerList = () => {
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    socket.on('update_players', (data) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: data.players });
    });

    return () => {
      socket.off('update_players');
    };
  }, [dispatch]);

  return (
    <div>
      <h3>Players</h3>
      <ul>
        {state.players.map((player) => (
          <li key={player.user_id}>
            User ID: {player.user_id} -{' '}
            {player.is_paused ? 'Paused' : player.is_active ? 'Active' : 'Inactive'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
