import React from 'react';
import { Broadcast, BroadcastFunctions } from '../util/broadcast';
import { UserFunctions } from '../util/user';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Dispatcher, DispatcherEvents } from '../util/dispatcher';
import { User } from '../util/user';

export async function loader({params: {id}}: {params: {id: string}}) {
  const broadcast = await BroadcastFunctions.getBroadcastAsync(id);
  console.log('Broadcast data loaded:', broadcast);
  return {broadcast};
}

export default function BroadcastPage() {
    const navigate = useNavigate();
    const data = useLoaderData() as {broadcast: Broadcast};
    const [broadcast, setBroadcast] = React.useState<Broadcast>(data.broadcast);
    const [broadcastUsers, setBroadcastUsers] = React.useState<User[]|null>(null);

    React.useEffect(() => {
      setBroadcast(data.broadcast);
      console.log('BroadcastPage useEffect');
      Dispatcher.addListener(DispatcherEvents.SET_BROADCAST_STATE + data.broadcast.id, setBroadcast);
      return () => {
        Dispatcher.removeListener(DispatcherEvents.SET_BROADCAST_STATE + data.broadcast.id, setBroadcast);
      };
    }, [data.broadcast]);

    React.useEffect(() => {
      async function getUsers() {
        setBroadcastUsers(null);
        if (!broadcast) {
          return;
        }
        setBroadcastUsers(await Promise.all([
          ...broadcast.listenerIds.map(UserFunctions.getUserAsync),
          ...broadcast.broadcasterIds.map(UserFunctions.getUserAsync),
        ]));
      }

      getUsers();
    }, [broadcast]);


    // if (!broadcast) {
    //     return (
    //         <h2>Broadcast not found</h2>
    //     );
    // }

    const handleDelete = () => {
    const confirmation = window.confirm('Are you sure you want to delete this broadcast?');
    if (confirmation) {
      // Logic to delete the broadcast
      BroadcastFunctions.terminate(broadcast.id);
      navigate('/');
    }
  };

  const handleEdit = () => {
    console.log('Edit broadcast:', broadcast.name);
    // TODO: Add actual broadcast editing logic
  };

  const handleListen = () => {
    BroadcastFunctions.listen(broadcast.id);
  }

  // TODO: rethink double join/leave logic
  const handleLeave = () => {
    BroadcastFunctions.leave(broadcast.id);
  } 

  const handleBroadcast = () => {
    BroadcastFunctions.broadcast(broadcast.id);
  }

  return (
    broadcast &&
    <div className="broadcast-page-container">
      <h2>{broadcast.name}</h2>
      <div className="broadcast-details">
        <h3>Room ID</h3>
        <p>{broadcast.id}</p>
        {broadcastUsers ? (<>
        <h3>Listeners: {broadcast.listenerIds.length}</h3>
        <ul>
          {broadcast.listenerIds.map(listenerId => (
            <li key={listenerId}>{broadcastUsers.find((user) => listenerId == user.id)?.name}</li>
          ))}
        </ul>
        <h3>Broadcasters: {broadcast.broadcasterIds.length}</h3>
        <ul>
          {broadcast.broadcasterIds.map(broadcasterId => (
            <li key={broadcasterId}>{broadcastUsers.find((user) => broadcasterId == user.id)?.name}</li>
          ))}
        </ul>
        </>)
        : (<p>Loading users...</p>)}
      </div>
      <div className="broadcast-actions">
        <button onClick={handleEdit} className="edit-button">Edit</button>
        <button onClick={handleDelete} className="delete-button">Delete</button>
        <button onClick={handleListen} className="join-button">Listen</button>
        <button onClick={handleBroadcast} className="join-button">Broadcast</button>
        <button onClick={handleLeave} className="leave-button">Leave</button>
      </div>
      <audio controls />
    </div>
  );
}
