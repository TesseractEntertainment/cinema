import express, { Request, Response, Router } from 'express';
const router: Router = express.Router();

// Create a new stream
router.post('/create', async (req: Request, res: Response) => {
    // ... implementation
    res.status(201).json({ message: 'Stream created successfully' });
});

// List all streams
router.get('/', async (req: Request, res: Response) => {
    const streams = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' }
    ];
    res.json(streams);
});

export default router;
