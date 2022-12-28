const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    customerName : {
        type : String,
        
    },
    productName :{
       type  : String
    },
    address : {
        type : String
    },
    orderStatus : {
        type : String,
        default : "placed"
    }
},{timestamps : true})

module.exports = OrderModel = mongoose.model('OrderData',orderSchema);