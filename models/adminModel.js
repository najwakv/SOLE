/* eslint-disable no-undef */
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type:String,
        required:true
    }
});

module.exports = AdminModel = mongoose.model('AdminData', adminSchema)