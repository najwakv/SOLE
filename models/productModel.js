const mongoose = require('mongoose');
const Objectid = mongoose.Types.ObjectId
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
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    category: {
        type: Objectid,
        required: true,
        ref:'CategoryData'
    },
    image: {
        type: [String],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status:{
        type: Boolean,
        default: false
    },
    
});
module.exports = ProductModel = mongoose.model('ProductData', productSchema);