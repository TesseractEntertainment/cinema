import React, { useState } from 'react';
import { BroadcastFunctions } from '../util/broadcast';
import '../styles/broadcast.css';
import { redirect, useNavigate } from 'react-router-dom';

function CreateBroadcastPage() {
  const navigate = useNavigate();
  const [broadcastName, setBroadcastName] = useState('');

  const handleCreateBroadcast = async (e: any) => {
    e.preventDefault();
    // Logic to create a new broadcast using the provided name
    console.log('Creating broadcast with name:', broadcastName);
    try{
      const id = await BroadcastFunctions.create(broadcastName);
      navigate('/broadcast/' + id);
    }
    catch(err){
      console.log(err);
    }
    // redirect to the new broadcast page
    // TODO: Add actual redirect logic
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
