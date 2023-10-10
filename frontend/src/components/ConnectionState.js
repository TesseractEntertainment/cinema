import React, { useEffect } from 'react';
import { Dispatcher, DispatcherEvent } from '../util/dispatcher';

export function ConnectionState() {
  const [isConnected, setConnected] = React.useState(false);
  useEffect(() => {
    Dispatcher.addListener(DispatcherEvent.SET_CONNECTION_STATE, setConnected);
    return () => {
      Dispatcher.removeListener(DispatcherEvent.SET_CONNECTION_STATE, setConnected);
    };
  }, []);
  return <p>State: { '' + isConnected }</p>;
}