import React, { useState } from 'react';
import { BroadcastFunctions } from '../util/broadcast';
import '../styles/broadcast.css';
import { redirect, useNavigate } from 'react-router-dom';

function CreateBroadcastPage() {
  const navigate = useNavigate();
  const [broadcastName, setBroadcastName] = useState('');

  const handleCreateBroadcast = (e: any) => {
    e.preventDefault();
    // Logic to create a new broadcast using the provided name
    console.log('Creating broadcast with name:', broadcastName);
    BroadcastFunctions.create(broadcastName);
    // redirect to the new broadcast page
    // TODO: Add actual redirect logic
    navigate('/');
  };

  return (
    <div className='create-broadcast-container'>
      <h2>Create New Broadcast</h2>
      <form onSubmit={handleCreateBroadcast} className='create-broadcast-form'>
        <label>
          Broadcast Name:
          <input
            type="text"
            value={broadcastName}
            onChange={(e) => setBroadcastName(e.target.value)}
          />
        </label>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateBroadcastPage;
