import React, { useEffect } from 'react';
import { Dispatcher, DispatcherEvents } from '../util/dispatcher';
import { ConnectionFunctions } from '../util/connection';

export function ConnectionState() {
  const [isConnected, setConnected] = React.useState(ConnectionFunctions.isConnected());
  useEffect(() => {
    Dispatcher.addListener(DispatcherEvents.SET_CONNECTION_STATE, setConnected);
    return () => {
      Dispatcher.removeListener(DispatcherEvents.SET_CONNECTION_STATE, setConnected);
    };
  }, []);
  return <p>State: { '' + isConnected }</p>;
}