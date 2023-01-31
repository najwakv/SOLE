/* eslint-disable no-undef */
const mongoose = require('mongoose');

const testimonySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
});
module.exports = TestimonyModel = mongoose.model('TestimonyData',testimonySchema);