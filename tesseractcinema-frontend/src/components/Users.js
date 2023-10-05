import React, { useEffect, useReducer } from 'react';

function ConnectionButton({ user, peerConnections, createOffer, disconnectPeer }) {
    console.log('user: ', user);
    const isConnected = peerConnections[user.id] && ['connected', 'stable'].includes(user.connectionState);
    const text = isConnected ? 'Disconnect' : 'Connect';
    const onClick = isConnected ? () => disconnectPeer(user.id) : () => createOffer(user.id);
    
    return (
        <button onClick={onClick}>{text}</button>
    );
}


export function Users({ users, peerConnections, createOffer, disconnectPeer, streamAudio, stopStream }) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => {
        console.log("updated");
    }, [users]);
  return (
    <div>
      <ul>
      {
          users.map((user) => 
            <li key={ user.id }>
                { user.id }
                <ConnectionButton user={user} peerConnections={peerConnections} createOffer={createOffer} disconnectPeer={disconnectPeer}/>
                { user.connectionState }
                {['connected', 'stable'].includes(user.connectionState) && <button onClick={() => {streamAudio(user.id).then(forceUpdate())}}>Stream</button>}
                {peerConnections[user.id] &&  peerConnections[user.id].streamTo && <button onClick={() => {stopStream(user.id); forceUpdate()}}>Stop</button>}
            </li>
          )
      }
      </ul>
    </div>
  );
}