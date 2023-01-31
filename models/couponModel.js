const mongoose = require('mongoose');
const { required } = require('nodemon/lib/config');

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    minimumAmount: {
        type: Number,
        required: true
    },
    maximumDiscount: {
        type: Number,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required:true
    },
    limit: {
        type: Number,
        required: true
    },
    times: {
        type: Number,
        default:0,
        required: true
    },
    status:{
        type: Boolean,
        default: false
    },
});
module.exports = CouponModel = mongoose.model('CoupenData',couponSchema);