const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Objectid = mongoose.Types.ObjectId

const cartSchema = new Schema({
    userId: {
        type: Objectid,
        ref: "userdetails"
    },
    items: [{
        productId: {
            type: Objectid,
            ref: "ProductData",
        },
        size: {
            type: Objectid,
            ref: "ProductData",
        },
        quantity: {
            type: Number,
            default: 1
        },
        productPrice: {
           type : Number,
            default: 0
        },
        totalPrice: {
            type : Number,
             default: 0
         },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    
    total: {
        type: Number,
        default: 0
    },
    subTotal: {
        type: Number,
        default: 0
    },
   
},{timestamps : true});

module.exports = CartModel = mongoose.model('CartData', cartSchema);