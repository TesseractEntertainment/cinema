import React, { useEffect } from 'react';
import { ConnectionEvents, socket } from './util/connection';
import { Outlet } from 'react-router-dom';
import { UserEvents } from './util/user';
import { SocketEvents } from './util/socketEvents';
import { BroadcastEvents } from './util/broadcast';

/*
  This is the root component of the application. It is responsible for setting up the socket listeners.
*/
export default function App() {
  useEffect(() => {
    socket.on(SocketEvents.UPDATE_USERS, UserEvents.onUpdateUsers);
    socket.on(SocketEvents.CREATE_USER, UserEvents.onUpdateUser);
    socket.on(SocketEvents.DELETE_USER, UserEvents.onDeleteUser);
    socket.on(SocketEvents.UPDATE_USER, UserEvents.onUpdateUser);

    socket.on(SocketEvents.JOIN_BROADCAST, BroadcastEvents.onJoinBroadcast);
    socket.on(SocketEvents.LEAVE_BROADCAST, BroadcastEvents.onLeaveBroadcast);
    socket.on(SocketEvents.CREATE_BROADCAST, BroadcastEvents.onCreateBroadcast);
    socket.on(SocketEvents.TERMINATE_BROADCAST, BroadcastEvents.onTerminateBroadcast);
    socket.on(SocketEvents.UPDATE_BROADCAST, BroadcastEvents.onUpdateBroadcast);
    socket.on(SocketEvents.UPDATE_BROADCASTS, BroadcastEvents.onUpdateBroadcasts);

    socket.on('connect', ConnectionEvents.onConnect);
    socket.on('disconnect', ConnectionEvents.onDisconnect);
    socket.on(SocketEvents.DISCONNECT_PEER, ConnectionEvents.onDisconnectPeer);
    socket.on(SocketEvents.REQUEST_STREAM, ConnectionEvents.onRequestStream);    
    socket.on(SocketEvents.ANSWER, ConnectionEvents.onAnswer);
    socket.on(SocketEvents.OFFER, ConnectionEvents.onOffer);
    socket.on(SocketEvents.ICE_CANDIDATE, ConnectionEvents.onIcecandidate);

    return () => {
      socket.off(SocketEvents.UPDATE_USERS, UserEvents.onUpdateUsers);
      socket.off(SocketEvents.CREATE_USER, UserEvents.onUpdateUser);
      socket.off(SocketEvents.DELETE_USER, UserEvents.onDeleteUser);
      socket.off(SocketEvents.UPDATE_USER, UserEvents.onUpdateUser);

      socket.off(SocketEvents.JOIN_BROADCAST, BroadcastEvents.onJoinBroadcast);
      socket.off(SocketEvents.LEAVE_BROADCAST, BroadcastEvents.onLeaveBroadcast);
      socket.off(SocketEvents.CREATE_BROADCAST, BroadcastEvents.onCreateBroadcast);
      socket.off(SocketEvents.TERMINATE_BROADCAST, BroadcastEvents.onTerminateBroadcast);
      socket.off(SocketEvents.UPDATE_BROADCAST, BroadcastEvents.onUpdateBroadcast);
      socket.off(SocketEvents.UPDATE_BROADCASTS, BroadcastEvents.onUpdateBroadcasts);

      socket.off('connect', ConnectionEvents.onConnect);
      socket.off('disconnect', ConnectionEvents.onDisconnect);
      socket.off(SocketEvents.DISCONNECT_PEER, ConnectionEvents.onDisconnectPeer);
      socket.off(SocketEvents.REQUEST_STREAM, ConnectionEvents.onRequestStream);      
      socket.off(SocketEvents.ANSWER, ConnectionEvents.onAnswer);
      socket.off(SocketEvents.OFFER, ConnectionEvents.onOffer);
      socket.off(SocketEvents.ICE_CANDIDATE, ConnectionEvents.onIcecandidate);
    };
  }, []);

  return (
    <div className="App">
      <Outlet />
    </div>
  );
}