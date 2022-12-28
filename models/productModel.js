const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    soldCount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = ProductModel = mongoose.model('ProductData', productSchema);