import React, { useEffect, useReducer, useState } from 'react';
import { ConnectionFunctions, PeerConnection } from '../util/connection';
import { Dispatcher, DispatcherEvents } from '../util/dispatcher';
import { User, UserFunctions } from '../util/user';
import '../styles/user.css';
import UserComp from './User';

export function Users() {
  const [users, setUsers] = useState<User[]>(UserFunctions.getUsers());
//   const [, forceUpdate] = useReducer(x => x + 1, 0);
//   const peerConnections = ConnectionFunctions.getPeerConnections();
  useEffect(() => {
      Dispatcher.addListener(DispatcherEvents.SET_USER_STATE, setUsers);
      return () => {
        Dispatcher.removeListener(DispatcherEvents.SET_USER_STATE, setUsers);
      };
  }, [users]);
  return (
    <div className="users-container">
        {users.map(user => (
            <UserComp user={user} connectionControlls/>
        ))}
    </div>
  );
}