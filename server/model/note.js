const mongoose = require('mongoose');

const Note = mongoose.model('Note', {
    date: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        default: 'Unknown Title',
        trim: true
    },
    body: {
        type: String,
        required: true,
    }
});

module.exports = {
    Note
}