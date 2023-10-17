import React, { useEffect } from 'react';
import { ConnectionEvents, socket } from './util/connection';
import { Outlet } from 'react-router-dom';
import { UserEvents } from './util/user';
import { SocketEvents } from './util/socketEvents';

/*
  This is the root component of the application. It is responsible for setting up the socket listeners.
*/
export default function App() {
  useEffect(() => {
    socket.on(SocketEvents.UPDATE_USERS, UserEvents.onUpdateUsers);
    socket.on(SocketEvents.CREATE_USER, UserEvents.onUpdateUser);
    socket.on(SocketEvents.DELETE_USER, UserEvents.onDeleteUser);

    socket.on(SocketEvents.DISCONNECT_PEER, ConnectionEvents.onDisconnectPeer);
    socket.on(SocketEvents.REQUEST_STREAM, ConnectionEvents.onRequestStream);    
    socket.on('connect', ConnectionEvents.onConnect);
    socket.on('disconnect', ConnectionEvents.onDisconnect);
    socket.on('answer', ConnectionEvents.onAnswer);
    socket.on('offer', ConnectionEvents.onOffer);
    socket.on('ice-candidate', ConnectionEvents.onIcecandidate);

    return () => {
      socket.off(SocketEvents.UPDATE_USERS, UserEvents.onUpdateUsers);
      socket.off(SocketEvents.CREATE_USER, UserEvents.onUpdateUser);
      socket.off(SocketEvents.DELETE_USER, UserEvents.onDeleteUser);

      socket.off(SocketEvents.DISCONNECT_PEER, ConnectionEvents.onDisconnectPeer);
      socket.off(SocketEvents.REQUEST_STREAM, ConnectionEvents.onRequestStream);      
      socket.off('connect', ConnectionEvents.onConnect);
      socket.off('disconnect', ConnectionEvents.onDisconnect);
      socket.off('answer', ConnectionEvents.onAnswer);
      socket.off('offer', ConnectionEvents.onOffer);
      socket.off('ice-candidate', ConnectionEvents.onIcecandidate);
    };
  }, []);

  return (
    <div className="App">
      <Outlet />
    </div>
  );
}