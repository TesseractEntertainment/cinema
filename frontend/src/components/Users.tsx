import React, { useEffect, useReducer, useState } from 'react';
import { disconnectPeer, streamAudio, stopStream, requestStream, getPeerConnections } from '../util/connection';
import { PeerConnection, User } from '../util/interfaces';
import { Dispatcher, DispatcherEvent } from '../util/dispatcher';

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
    <div>
      <ul>
      {
          users.map((user) => 
            <li key={ user.id }>
                { user.id }
                <ConnectionButton user={user} peerConnections={peerConnections} />
                { user.connectionState }
                {['connected', 'stable'].includes(user.connectionState) && <button onClick={() => {streamAudio(user.id).then(()=>forceUpdate())}}>Stream</button>}
                {peerConnections.has(user.id) &&  peerConnections.get(user.id)!.hasOutgoingAudio && <button onClick={() => {stopStream(user.id); forceUpdate()}}>Stop</button>}
            </li>
          )
      }
      </ul>
    </div>
  );
}