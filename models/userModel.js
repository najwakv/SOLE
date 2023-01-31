const mongoose = require('mongoose');
const objectid = mongoose.Types.ObjectId
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default:'Unblocked'
    },
    address : [{
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
    }],
    wishlist: [{
        type: objectid,
        ref : "ProductData"
        
    }]
});

module.exports = UserModel = mongoose.model('UserData', userSchema);