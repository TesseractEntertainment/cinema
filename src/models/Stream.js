import mongoose from 'mongoose';

const streamSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: { type: Date, default: Date.now }
});

export default mongoose.model('Stream', streamSchema);
