// src/components/UserSearch.jsx
import React, { useState } from 'react';
import { searchUsers } from '../services/api';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await searchUsers(query);
      setResults(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h3>Search Users</h3>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter UID or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {results.map((user) => (
          <li key={user.id}>{user.name} (UID: {user.uid})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
