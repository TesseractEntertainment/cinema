import { io } from 'socket.io-client';
// "undefined" means the URL will be computed from the `window.location` object
const URL: any = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
// const URL: any = process.env.NODE_ENV === 'production' ? undefined : 'http://192.168.1.107:4000';
/**
 * The socket object that is used to connect to the server.
*/
console.log('created socket to ', URL);
const socket = io(URL, { autoConnect: false });

export default socket;