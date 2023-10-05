import express from 'express';
import { createServer, get } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import streamRoutes from './routes/streamRoutes.js';

const PORT = 4000;
const SIGNALPORT = 4000;

const app = express();
const http = createServer(app);

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.static('./tesseractcinema-frontend/public'));

app.get('/', (req, res) => {
    res.send('TesseractCinema Backend');
});

http.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// MongoDB

mongoose.connect('mongodb://127.0.0.1:27017/tesseractcinema', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Socket.io
const io = new Server(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let activeBroadcasters = [];
let broadcasts = {};

io.on('connection', (socket) => {
    console.log('a user connected: ', socket.id);

    // Send the current list of broadcasters to the newly connected client
    socket.emit('update-broadcast-list', getActiveBroadcasts());
    io.emit('update-users', getUserIds());    
    console.log('updated users: ', getUserIds());
    console.log('updated broadcast list: ', getActiveBroadcasts());

    // When a user wants to start broadcasting
    socket.on('start-broadcast', (data) => {
        broadcasts[socket.id] = {
            broadcaster: socket.id,
            listeners: []
        };
        activeBroadcasters.push(socket.id);
        socket.join(`broadcast_${socket.id}`);
        console.log('activeBroadcasters: ', getActiveBroadcasts());
        // Notify all users about the new broadcast
        io.emit('update-broadcast-list', getActiveBroadcasts());
    });

    socket.on('join-broadcast', (broadcasterId) => {
        // Logic to handle a listener joining a broadcast

        // For example, if you're using rooms in socket.io:
        socket.join(`broadcast_${broadcasterId}`);

        // Notify the broadcaster that a new listener has joined
        io.to(broadcasterId).emit('new-listener', socket.id);
    });

    socket.on('create-something', (value) => {
        socket.emit('foo', value);
    });

    socket.on('offer', (offer, userId) => {
        socket.to(userId).emit('offer', offer, socket.id);
    });
    
    socket.on('answer', (answer, userId) => {
        socket.to(userId).emit('answer', answer, socket.id);
    });

    // When a user sends an ICE candidate
    socket.on('ice-candidate', (iceCandidate, userId) => {
        // Broadcast the ICE candidate to the other user
        // console.log('new ice candidate from ', socket.id);
        socket.to(userId).emit('ice-candidate', iceCandidate, socket.id);
        // console.log('ice-candidate broadcasted');
    });

    socket.on('disconnect-peer', (userId) => {
        socket.to(userId).emit('disconnect-peer', socket.id);
    });

    socket.on('request-stream', (userId) => {
        socket.to(userId).emit('request-stream', socket.id);
    });

    socket.on('disconnect', () => {
        activeBroadcasters = activeBroadcasters.filter(id => id !== socket.id);
        io.emit('update-users', getUserIds());    
        io.emit('update-broadcast-list', getActiveBroadcasts());
        console.log('user disconnected: ', socket.id);
    });
});

function getActiveBroadcasts() {
    const rooms = io.sockets.adapter.rooms;
    console.log('Rooms: ', rooms.keys());
    const broadcastRooms = Array.from(rooms.keys()).filter(roomName => roomName.startsWith('broadcast_'));
    console.log('Broadcast rooms: ', broadcastRooms);
    return broadcastRooms;
}

function getUserIds() {
    return Array.from(io.sockets.sockets.keys());
}




// Routes
app.use('/api/streams', streamRoutes);
