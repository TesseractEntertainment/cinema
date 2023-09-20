const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stream', streamSchema);
