import React from 'react';
import { Broadcast, BroadcastFunctions } from '../util/broadcast';
import { UserFunctions } from '../util/user';
import { redirect, useLoaderData, useNavigate } from 'react-router-dom';

export function loader({params: {id}}: {params: {id: string}}) {
    const broadcast = BroadcastFunctions.getBroadcast(id);
    return {broadcast};
  }

export default function BroadcastPage() {
    const navigate = useNavigate();
    const {broadcast} = useLoaderData() as {broadcast: Broadcast | undefined};
    if (!broadcast) {
        return (
            <h2>Broadcast not found</h2>
        );
    }
    const handleDelete = () => {
    const confirmation = window.confirm('Are you sure you want to delete this broadcast?');
    if (confirmation) {
      // Logic to delete the broadcast
      BroadcastFunctions.terminate(broadcast.id);
      navigate('/');
    }
  };

  const handleEdit = () => {
    // Logic to edit the broadcast
    console.log('Edit broadcast:', broadcast?.name);
    // TODO: Add actual broadcast editing logic
  };

  const handleJoin = () => {
    BroadcastFunctions.listen(broadcast.id);
  }

  const handleLeave = () => {
    BroadcastFunctions.leave(broadcast.id);
  } 

  return (
    broadcast &&
    <div className="broadcast-page-container">
      <h2>{broadcast.name}</h2>
      <div className="broadcast-details">
        <h3>Room ID</h3>
        <p>{broadcast.id}</p>
        <h3>Listeners</h3>
        <ul>
          {broadcast.listenerIds.map(listenerId => (
            <li key={listenerId}>{UserFunctions.getUser(listenerId)?.name}</li>
          ))}
        </ul>
        <h3>Broadcasters</h3>
        <ul>
          {broadcast.broadcasterIds.map(broadcasterId => (
            <li key={broadcasterId}>{UserFunctions.getUser(broadcasterId)?.name}</li>
          ))}
        </ul>
      </div>
      <div className="broadcast-actions">
        <button onClick={handleEdit} className="edit-button">Edit</button>
        <button onClick={handleDelete} className="delete-button">Delete</button>
        <button onClick={handleJoin} className="join-button">Join</button>
      </div>
    </div>
  );
}
