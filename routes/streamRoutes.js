import express from 'express';
import Stream from '../models/Stream.js';
const router = express.Router();

// Create a new stream
router.post('/create', async (req, res) => {
    // ... implementation
    res.status(201).json({ message: 'Stream created successfully' });
});

// List all streams
router.get('/', async (req, res) => {
    const streams = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' }
    ];
    res.json(streams);
});

export default router;
