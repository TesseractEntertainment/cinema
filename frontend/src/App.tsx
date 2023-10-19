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
    socket.on(SocketEvents.User.USERS, UserEvents.onUsers);
    socket.on(SocketEvents.User.CREATED, UserEvents.onUpdate);
    socket.on(SocketEvents.User.DELETED, UserEvents.onDelete);
    socket.on(SocketEvents.User.UPDATED, UserEvents.onUpdate);

    socket.on(SocketEvents.Broadcast.LISTENER_JOINED, BroadcastEvents.onListenerJoin);
    socket.on(SocketEvents.Broadcast.LISTENER_LEFT, BroadcastEvents.onListenerLeave);
    socket.on(SocketEvents.Broadcast.CREATED, BroadcastEvents.onCreate);
    socket.on(SocketEvents.Broadcast.TERMINATED, BroadcastEvents.onTerminate);
    socket.on(SocketEvents.Broadcast.UPDATED, BroadcastEvents.onUpdate);
    socket.on(SocketEvents.Broadcast.BROADCASTS, BroadcastEvents.onBroadcasts);

    socket.on('connect', ConnectionEvents.onConnect);
    socket.on('disconnect', ConnectionEvents.onDisconnect);
    socket.on(SocketEvents.Signaling.DISCONNECTED, ConnectionEvents.onDisconnectPeer);
    socket.on(SocketEvents.Signaling.REQUESTED_AUDIO, ConnectionEvents.onRequestStream);
    // TODO: implement remaining events
    socket.on(SocketEvents.Signaling.ANSWER, ConnectionEvents.onAnswer);
    socket.on(SocketEvents.Signaling.OFFER, ConnectionEvents.onOffer);
    socket.on(SocketEvents.Signaling.ICE_CANDIDATE, ConnectionEvents.onIcecandidate);

    return () => {
      socket.off(SocketEvents.User.USERS, UserEvents.onUsers);
      socket.off(SocketEvents.User.CREATED, UserEvents.onUpdate);
      socket.off(SocketEvents.User.DELETED, UserEvents.onDelete);
      socket.off(SocketEvents.User.UPDATED, UserEvents.onUpdate);

      socket.off(SocketEvents.Broadcast.LISTENER_JOINED, BroadcastEvents.onListenerJoin);
      socket.off(SocketEvents.Broadcast.LISTENER_LEFT, BroadcastEvents.onListenerLeave);
      socket.off(SocketEvents.Broadcast.CREATED, BroadcastEvents.onCreate);
      socket.off(SocketEvents.Broadcast.TERMINATED, BroadcastEvents.onTerminate);
      socket.off(SocketEvents.Broadcast.UPDATED, BroadcastEvents.onUpdate);
      socket.off(SocketEvents.Broadcast.BROADCASTS, BroadcastEvents.onBroadcasts);

      socket.off('connect', ConnectionEvents.onConnect);
      socket.off('disconnect', ConnectionEvents.onDisconnect);
      socket.off(SocketEvents.Signaling.DISCONNECTED, ConnectionEvents.onDisconnectPeer);
      socket.off(SocketEvents.Signaling.REQUESTED_AUDIO, ConnectionEvents.onRequestStream);

      socket.off(SocketEvents.Signaling.ANSWER, ConnectionEvents.onAnswer);
      socket.off(SocketEvents.Signaling.OFFER, ConnectionEvents.onOffer);
      socket.off(SocketEvents.Signaling.ICE_CANDIDATE, ConnectionEvents.onIcecandidate);

    };
  }, []);

  return (
    <div className="App">
      <Outlet />
    </div>
  );
}