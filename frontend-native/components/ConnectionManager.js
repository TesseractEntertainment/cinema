import React from 'react';
import { socket } from '../socket';
import { Button } from 'react-native';

export function ConnectionManager() {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <>
      <Button onClick={ connect }>Connect</Button>
      <Button onClick={ disconnect }>Disconnect</Button>
    </>
  );
}