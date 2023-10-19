import { Socket } from 'socket.io';
import streamRoutes from './routes/streamRoutes';
import { BroadcastFunctions } from './util/Broadcast';
import { User, UserFunctions } from './util/User';
import { app, io } from './util/io';
import { SocketEvents } from './util/socketEvents';

io.on('connection', (socket) => {
    UserFunctions.createUser(socket.id);
    UserFunctions.sendUpdatedUsersTo(socket.id);
    BroadcastFunctions.sendUpdatedBroadcastsTo(socket.id);

    // Signaling
    socket.on(SocketEvents.Signaling.OFFER, (offer, userId) => {
        socket.to(userId).emit(SocketEvents.Signaling.OFFER, offer, socket.id);
    });
    socket.on(SocketEvents.Signaling.ANSWER, (answer, userId) => {
        socket.to(userId).emit(SocketEvents.Signaling.ANSWER, answer, socket.id);
    });
    socket.on(SocketEvents.Signaling.ICE_CANDIDATE, (iceCandidate, userId) => {
        socket.to(userId).emit(SocketEvents.Signaling.ICE_CANDIDATE, iceCandidate, socket.id);
    });
    socket.on(SocketEvents.Signaling.DISCONNECTED, (userId) => {
        socket.to(userId).emit(SocketEvents.Signaling.DISCONNECTED, socket.id);
    });
    socket.on(SocketEvents.Signaling.REQUEST_AUDIO, (userId) => {
        socket.to(userId).emit(SocketEvents.Signaling.REQUESTED_AUDIO, socket.id);
    });
    socket.on(SocketEvents.Signaling.REQUESTED_STOP_AUDIO, (userId) => {
        socket.to(userId).emit(SocketEvents.Signaling.REQUESTED_STOP_AUDIO, socket.id);
    });

    // Broadcast
    socket.on(SocketEvents.Broadcast.REQUEST_LISTEN, (broadcastId) => {
        BroadcastFunctions.joinBroadcast(socket.id, broadcastId);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_BROADCAST, (broadcastId) => {
        BroadcastFunctions.joinBroadcast(socket.id, broadcastId, true);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_LEAVE, (broadcastId) => {
        BroadcastFunctions.leaveBroadcast(socket.id, broadcastId);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_TERMINATE, (broadcastId) => {
        BroadcastFunctions.terminateBroadcast(broadcastId);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_CREATE, (name) => {
        BroadcastFunctions.createBroadcast(name);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_UPDATE, (broadcast) => {
        BroadcastFunctions.updateBroadcast(broadcast);
    });

    // User
    socket.on(SocketEvents.User.REQUEST_CREATE, (name) => {
        UserFunctions.createUser(socket.id, name);
    });
    socket.on(SocketEvents.User.REQUEST_UPDATE, (id, name) => {
        UserFunctions.updateUser(id, name);
    });
    socket.on(SocketEvents.User.REQUEST_DELETE, (userId) => {
        UserFunctions.deleteUser(userId);
    });

    socket.on('disconnect', () => {
        // Expect bugs?
        socket.offAny();
        // Leave all broadcasts
        UserFunctions.deleteUser(socket.id); 
        console.log('user disconnected: ', UserFunctions.getUser(socket.id)?.name);
    });
});

// Routes
app.use('/api/streams', streamRoutes);
