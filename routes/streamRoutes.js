const express = require('express');
const router = express.Router();
const Stream = require('../models/Stream');

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

module.exports = router;
