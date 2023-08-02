/* eslint-disable no-undef */
const mongoose = require('mongoose')

const trackSchema = new mongoose.Schema({
    
    address : {
        type: Object,
        trim: true
      },
    userId : {
        type: String,
        trim: true
      }, 
    items : {
        type: Array,
        trim: true
        
      },
    paymentMethod : {
        type: String,
        trim: true
      },
    paymentStatus : {
        type: String,
        trim: true
      },
      orderStatus : {
        type: String,
        trim: true
      },
      
    totalProduct : {
        type: Number,
        trim: true
      },
    totalAmount : {
        type: Number,
        trim: true
      },
    deliveryDate : {
      type: String,
      trim: true
      },
    productName : {
      type: String,
    },
    image : {
      type: [String],
    }
},{timestamps : true})

module.exports = TrackModel = mongoose.model('TrackData',trackSchema);