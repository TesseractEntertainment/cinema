const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('./tesseractcinema-frontend/build'));

app.get('/', (req, res) => {
    res.send('TesseractCinema Backend');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// MongoDB
const mongoose = require('mongoose');

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
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('start-broadcast', (data) => {
        // Handle broadcast start
        // For example, you might emit this to other users to notify them
        io.emit('new-broadcast', data);
    });

    socket.on('join-broadcast', (data) => {
        // Handle joining a broadcast
        // You can use socket.join() to add the user to a specific broadcast "room"
        socket.join(data.broadcastId);
    });

    socket.on('send-message', (message) => {
        // Handle chat message
        // If using rooms, you can emit the message to a specific room
        socket.to(message.broadcastId).emit('receive-message', message);
    });

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (iceCandidate) => {
        socket.broadcast.emit('ice-candidate', iceCandidate);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
    
http.listen(3001, () => {
    console.log('Signaling server running on http://localhost:3001');
});



// Routes
const streamRoutes = require('./routes/streamRoutes');
app.use('/api/streams', streamRoutes);
