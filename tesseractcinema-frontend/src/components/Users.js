import React, { useEffect } from 'react';

function ConnectionButton({ userId, peerConnections, createOffer, disconnectPeer }) {
    const isConnected = peerConnections[userId] && peerConnections[userId].connectionState === 'connected';
    const text = isConnected ? 'Disconnect' : 'Connect';
    const onClick = isConnected ? () => disconnectPeer(userId) : () => createOffer(userId);
    
    return (
        <button onClick={onClick}>{text}</button>
    );
}


export function Users({ users, peerConnections, createOffer, disconnectPeer }) {
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
                <ConnectionButton userId={user.id} peerConnections={peerConnections} createOffer={createOffer} disconnectPeer={disconnectPeer}/>
                { user.connectionState }
            </li>
          )
      }
      </ul>
    </div>
  );
}