import express, { Express, Request, Response } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import mongoose, { Connection } from 'mongoose';

const PORT: number = 4000;

export const app: Express = express();
export const http: HTTPServer = createServer(app);

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.static('./tesseractcinema-frontend/public'));

app.get('/', (req: Request, res: Response) => {
    res.send('TesseractCinema Backend');
});

http.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// MongoDB
// mongoose.connect('mongodb://127.0.0.1:27017/tesseractcinema');

// export const db: Connection = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//     console.log('Connected to MongoDB');
// });

// Socket.io

export const io: Server = new Server(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});