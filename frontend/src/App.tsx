import React, { useEffect } from 'react';
import { onAnswer, onConnect, onDisconnect, onDisconnectPeer, onIcecandidate, onOffer, onRequestStream, socket } from './util/connection';
import { Outlet } from 'react-router-dom';
import { onUpdateUsers } from './util/users';

/*
  This is the root component of the application. It is responsible for setting up the socket listeners.
*/
export default function App() {
  useEffect(() => {
    socket.on('update-users', onUpdateUsers);

    socket.on('disconnect-peer', onDisconnectPeer);
    socket.on('request-stream', onRequestStream);    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('answer', onAnswer);
    socket.on('offer', onOffer);
    socket.on('ice-candidate', onIcecandidate);

    return () => {
      socket.off('update-users', onUpdateUsers);

      socket.off('disconnect-peer', onDisconnectPeer);
      socket.off('request-stream', onRequestStream);      
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('answer', onAnswer);
      socket.off('offer', onOffer);
      socket.off('ice-candidate', onIcecandidate);
    };
  }, []);

  return (
    <div className="App">
      <Outlet />
    </div>
  );
}