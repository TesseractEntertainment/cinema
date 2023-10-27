import React, { useEffect } from 'react';
import socket from './socket';
import { Outlet } from 'react-router-dom';
import { SocketEvents } from './common/socketEvents';
import { Dispatcher, DispatcherEvents } from './util/dispatcher';
import './util/connection';

export function onError(...errors: any[]) {
  var errorMessage = "";
  if (!errors) {
    errorMessage = 'An unknown error occurred';
  } else {
    errors.forEach((error) => {
      if (typeof error === 'string') {
        errorMessage += error;
      } else if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += JSON.stringify(error);
      }
      errorMessage += '\n';
    });
    errorMessage = errorMessage.trim();
  }
  console.error(errorMessage);
  Dispatcher.dispatch(DispatcherEvents.SET_ERROR_MESSAGE_STATE, errorMessage);
}

/**
  This is the root component of the application. It is responsible for setting up the socket listeners.
*/
export default function App({children}: {children: React.ReactNode}) {
  useEffect(() => {
    socket.on(SocketEvents.Util.ERROR, onError);

    return () => {
      socket.off(SocketEvents.Util.ERROR, onError);
    };
  }, []);

  return (
    <div className="App">
      {children}
      <Outlet />
    </div>
  );
}