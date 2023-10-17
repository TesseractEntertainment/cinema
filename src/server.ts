import { Socket } from 'socket.io';
import streamRoutes from './routes/streamRoutes';
import { BroadcastFunctions } from './util/broadcast';
import { UserFunctions } from './util/user';
import { app, io } from './util/io';
import { SocketEvents } from './util/socketEvents';

io.on('connection', (socket) => {
    UserFunctions.createUser(socket);
    UserFunctions.sendUpdatedUsersTo(socket.id);
    BroadcastFunctions.sendUpdatedBroadcastsTo(socket.id);

    // Signaling
    socket.on(SocketEvents.OFFER, (offer, userId) => {
        socket.to(userId).emit(SocketEvents.OFFER, offer, socket.id);
    });
    socket.on(SocketEvents.ANSWER, (answer, userId) => {
        socket.to(userId).emit(SocketEvents.ANSWER, answer, socket.id);
    });
    socket.on(SocketEvents.ICE_CANDIDATE, (iceCandidate, userId) => {
        socket.to(userId).emit(SocketEvents.ICE_CANDIDATE, iceCandidate, socket.id);
    });
    socket.on(SocketEvents.DISCONNECT_PEER, (userId) => {
        socket.to(userId).emit(SocketEvents.DISCONNECT_PEER, socket.id);
    });
    socket.on(SocketEvents.REQUEST_STREAM, (userId) => {
        socket.to(userId).emit(SocketEvents.REQUEST_STREAM, socket.id);
    });

    // Broadcast
    socket.on(SocketEvents.JOIN_BROADCAST, (broadcastId) => {
        BroadcastFunctions.joinBroadcast(socket.id, broadcastId);
    });
    socket.on(SocketEvents.LEAVE_BROADCAST, (broadcastId) => {
        BroadcastFunctions.leaveBroadcast(socket.id, broadcastId);
    });
    socket.on(SocketEvents.TERMINATE_BROADCAST, (broadcastId) => {
        BroadcastFunctions.terminateBroadcast(broadcastId);
    });
    socket.on(SocketEvents.CREATE_BROADCAST, (name) => {
        BroadcastFunctions.createBroadcast(name);
    });
    socket.on(SocketEvents.UPDATE_BROADCAST, (broadcast) => {
        BroadcastFunctions.updateBroadcast(broadcast);
    });

    socket.on('disconnect', () => {
        // Leave all broadcasts
        UserFunctions.deleteUser(socket.id); 
        console.log('user disconnected: ', UserFunctions.getUser(socket.id)?.name);
    });
});

// Routes
app.use('/api/streams', streamRoutes);
