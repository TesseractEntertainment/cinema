import { Socket } from 'socket.io';
import streamRoutes from './routes/streamRoutes';
import { Broadcast } from './util/Broadcast';
import { User } from './util/User';
import { app, io } from './io';
import { send } from 'process';

io.on('connection', (socket) => {
    createUser(socket);

    socket.on('join-broadcast', ({roomId, isBroadcaster = false}) => {
        joinBroadcast(users.get(socket.id), roomId, isBroadcaster);
    });

    // Signaling
    socket.on('offer', (offer, userId) => {
        socket.to(userId).emit('offer', offer, socket.id);
    });
    socket.on('answer', (answer, userId) => {
        socket.to(userId).emit('answer', answer, socket.id);
    });
    socket.on('ice-candidate', (iceCandidate, userId) => {
        socket.to(userId).emit('ice-candidate', iceCandidate, socket.id);
    });
    socket.on('disconnect-peer', (userId) => {
        socket.to(userId).emit('disconnect-peer', socket.id);
    });

    // Temporary
    socket.on('request-stream', (userId) => {
        socket.to(userId).emit('request-stream', socket.id);
    });

    socket.on('disconnect', () => {
        // Leave all broadcasts
        removeUser(socket); 
        console.log('user disconnected: ', users.get(socket.id)?.name);
    });
});

const users: Map<string, User> = new Map();
const broadcasts: Map<string, Broadcast> = new Map();

function sendUpdateUsers() {
    io.emit('update-users', Array.from(users.values()));
}

function createUser(socket: Socket, name?: string) {
    const user = new User(socket, name);
    users.set(socket.id, user);
    console.log(users);
    sendUpdateUsers();
    socket.emit('update-broadcasts', broadcasts); 
    console.log('a user was added: ', user.name);
    return user;
}

function removeUser(socket: Socket) {
    const user = users.get(socket.id);
    if (!user) {
        return;
    }
    socket.rooms.forEach((room) => {
        const broadcast = broadcasts.get(room);
        if (broadcast) {
            broadcast.leave(user);
        }
    });
    users.delete(user.id);
    sendUpdateUsers();
    console.log('user removed: ', user.name);   
}

function createBroadcast(name?: string) {
    const broadcast = new Broadcast(name);
    broadcasts.set(broadcast.roomId, broadcast);
    console.log('broadcast created: ', broadcast.name);
    return broadcast;
}

function terminateBroadcast(roomId: string) {
    const broadcast = broadcasts.get(roomId);
    if (!broadcast) {
        return;
    }
    broadcast.close();
    broadcasts.delete(roomId);
    console.log('broadcast terminated: ', broadcast.name);
}

function joinBroadcast(user: User|undefined, roomId: string, isBroadcaster = false) {
    if (!user) {
        return;
    }
    const broadcast = broadcasts.get(roomId);
    if (!broadcast) {
        return; 
    }
    if (isBroadcaster) {
        broadcast.joinAsBroadcaster(user);
    } else {
        broadcast.joinAsListener(user);
    }
    console.log(user.name, ' joined broadcast: ', broadcast.name);
}

function leaveBroadcast(user: User|undefined, roomId: string) {
    if (!user) {
        return;
    }
    const broadcast = broadcasts.get(roomId);
    if (!broadcast) {
        return;
    }
    broadcast.leave(user);
    console.log(user.name, ' left broadcast: ', broadcast.name);
}


// Routes
app.use('/api/streams', streamRoutes);
