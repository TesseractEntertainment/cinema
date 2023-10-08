import React, { useEffect, useReducer } from 'react';
import { View, Text, Button } from 'react-native';

function ConnectionButton({ user, peerConnections, createOffer, disconnectPeer }) {
    console.log('user: ', user);
    const isConnected = peerConnections[user.id] && ['connected', 'stable'].includes(user.connectionState);
    const text = isConnected ? 'Disconnect' : 'Connect';
    const onClick = isConnected ? () => disconnectPeer(user.id) : () => createOffer(user.id);
    
    return (
        <Button onClick={onClick}>{text}</Button>
    );
}


export function Users({ users, peerConnections, createOffer, disconnectPeer, streamAudio, stopStream }) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => {
        console.log("updated");
    }, [users]);
  return (
    <View>
      <ul>
      {
          users.map((user) => 
            <li key={ user.id }>
                <Text>{user.id}</Text>
                <ConnectionButton user={user} peerConnections={peerConnections} createOffer={createOffer} disconnectPeer={disconnectPeer}/>
                <Text>{user.connectionState}</Text>
                {['connected', 'stable'].includes(user.connectionState) && <Button onClick={() => {streamAudio(user.id).then(forceUpdate())}}>Stream</Button>}
                {peerConnections[user.id] &&  peerConnections[user.id].streamTo && <Button onClick={() => {stopStream(user.id); forceUpdate()}}>Stop</Button>}
            </li>
          )
      }
      </ul>
    </View>
  );
}