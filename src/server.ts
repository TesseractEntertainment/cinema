import { Socket } from 'socket.io';
import streamRoutes from './routes/streamRoutes';
import { BroadcastFunctions } from './util/Broadcast';
import { User, UserFunctions } from './util/User';
import { app, io } from './util/io';
import { SocketEvents } from '../frontend/src/common/socketEvents';
import { BroadcastDTO } from './util/DTOs';

io.on('connection', (socket) => {
    UserFunctions.createUser(socket.id);

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
    socket.on(SocketEvents.Broadcast.REQUEST_LISTEN, (broadcastId, callback) => {
        acknowledge(socket.id, callback, BroadcastFunctions.joinBroadcast, socket.id, broadcastId);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_BROADCAST, (broadcastId, callback) => {
        acknowledge(socket.id, callback, BroadcastFunctions.joinBroadcast, socket.id, broadcastId, true);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_LEAVE, (broadcastId, callback) => {
        acknowledge(socket.id, callback, BroadcastFunctions.leaveBroadcast, socket.id, broadcastId);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_TERMINATE, (broadcastId, callback) => {
        acknowledge(socket.id, callback, BroadcastFunctions.terminateBroadcast, broadcastId);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_CREATE, (name, callback) => {
        acknowledge(socket.id, callback, () => BroadcastFunctions.createBroadcast(name).id);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_UPDATE, (broadcast, callback) => {
        acknowledge(socket.id, callback, BroadcastFunctions.updateBroadcast, broadcast);
    });
    socket.on(SocketEvents.Broadcast.GET_BROADCASTS, (callback) => {
        acknowledge(socket.id, callback, BroadcastDTO.fromBroadcastMap, BroadcastFunctions.getBroadcasts());
    });
    socket.on(SocketEvents.Broadcast.GET_BROADCAST, (broadcastId, callback) => {
        acknowledge(socket.id, callback, BroadcastFunctions.getBroadcastDTO, broadcastId);
    });
    socket.on(SocketEvents.Broadcast.REQUEST_BROADCASTS, (callback) => {
        acknowledge(socket.id, callback, BroadcastFunctions.sendBroadcastsTo, socket.id);
    })

    // User
    socket.on(SocketEvents.User.REQUEST_CREATE, (name, callback) => {
        acknowledge(socket.id, callback, UserFunctions.createUser, socket.id, name);
    });
    socket.on(SocketEvents.User.REQUEST_UPDATE, (id, name, callback) => {
        acknowledge(socket.id, callback, UserFunctions.updateUser, id, name);
    });
    socket.on(SocketEvents.User.REQUEST_DELETE, (userId, callback) => {
        acknowledge(socket.id, callback, UserFunctions.deleteUser, userId);
    });
    socket.on(SocketEvents.User.REQUEST_USERS, (callback) => {
        acknowledge(socket.id, callback, UserFunctions.sendUsersTo, socket.id);
    });
    socket.on(SocketEvents.User.GET_USERS, (callback) => {
        acknowledge(socket.id, callback, Array.from, UserFunctions.getUsers().values());
    });
    socket.on(SocketEvents.User.GET_USER, (userId, callback) => {
        acknowledge(socket.id, callback, UserFunctions.getUser, userId);
    });

    socket.on('disconnect', () => {
        // Expect bugs?
        socket.offAny();
        // Leave all broadcasts
        UserFunctions.deleteUser(socket.id); 
    });
});

// Routes
app.use('/api/streams', streamRoutes);

function sendError(socket: Socket, error: any) {
    const errorString = error instanceof Error ? error.message : error?.toString();
    socket.emit(SocketEvents.Util.ERROR, errorString);
}
function sendErrorTo(socketId: string, error: any) {
    const errorString = error instanceof Error ? error.message : error?.toString();
    io.to(socketId).emit(SocketEvents.Util.ERROR, errorString);
}

function getErrorMessage(error: any) {
    const errorMessage = error.message;
    return errorMessage ? errorMessage : error.toString();
}

function acknowledge(socketId: string, callback: Function, returnAction: Function, ...args: any[]) {
    try {
        const result = returnAction(...args);
        if(callback instanceof Function) callback(result, true);
        else console.error('no callback' + (returnAction.name ? ' for ' + returnAction.name : ''));
        console.log('acknowledged ' + (returnAction.name ? returnAction.name : '') + ' for ' + socketId);
    } catch (err) {
        console.error(err);
        if(callback instanceof Function) callback(getErrorMessage(err), false);
        else sendErrorTo(socketId, err);
    }
}