/* eslint-disable no-unused-vars */

const mongoose = require('mongoose');
const { required } = require('nodemon/lib/config');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required:true
    },
    status:{
        type: Boolean,
        default: false
    },
});
// eslint-disable-next-line no-undef
module.exports = CategoryModel = mongoose.model('CategoryData', categorySchema);