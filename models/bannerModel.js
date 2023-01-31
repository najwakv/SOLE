/* eslint-disable no-undef */
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    bannerName: {
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
    status:{
        type: Boolean,
        default: false
    },
});

module.exports = BannerModel = mongoose.model('BannerData', bannerSchema);