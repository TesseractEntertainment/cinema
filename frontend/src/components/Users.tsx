import React, { useEffect, useReducer, useState } from 'react';
import { disconnectPeer, streamAudio, stopStream, requestStream, getPeerConnections, createPeerConnection } from '../util/connection';
import { PeerConnection, User } from '../util/interfaces';
import { Dispatcher, DispatcherEvent } from '../util/dispatcher';
import '../styles/users.css';

interface ConnectionButtonProps {
    user: User;
    peerConnections: Map<string, PeerConnection>;
}
function ConnectionButton({user, peerConnections}: ConnectionButtonProps) {
    console.log('user: ', user);
    const isConnected = peerConnections.has(user.id) && ['connected', 'stable'].includes(user.connectionState);
    const text = isConnected ? 'Disconnect' : 'Connect';
    const onClick = isConnected ? () => disconnectPeer(user.id) : () => requestStream(user.id);
    
    return (
        <button onClick={onClick}>{text}</button>
    );
}

function onConnect(userId: string) {
    createPeerConnection(userId);
}
function onDisconnect(userId: string) {
    disconnectPeer(userId);
}
function onRequestStream(userId: string) {
    requestStream(userId);
}
function onStreamTo(userId: string) {
    streamAudio(userId);
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const peerConnections = getPeerConnections();
  useEffect(() => {
      Dispatcher.addListener(DispatcherEvent.SET_USER_STATE, setUsers);
      return () => {
        Dispatcher.removeListener(DispatcherEvent.SET_USER_STATE, setUsers);
      };
  }, [users]);
  return (
    <div className="users-container">
        {users.map(user => (
            <div key={user.id} className="user-item">
                <span className="user-name">{user.name}</span>
                <span className={`connection-state ${user.connectionState}`}>{user.connectionState}</span>
                {user.connectionState === 'disconnected' ? (
                    <button onClick={() => onConnect(user.id)}>Connect</button>
                ) : (
                    <>
                        <button onClick={() => onDisconnect(user.id)}>Disconnect</button>
                        <button onClick={() => onRequestStream(user.id)}>Request Stream</button>
                        <button onClick={() => onStreamTo(user.id)}>Stream To</button>
                    </>
                )}
            </div>
        ))}
    </div>
  );
}