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
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active'
    }
});
module.exports = TestimonyModel = mongoose.model('TestimonyData',testimonySchema);