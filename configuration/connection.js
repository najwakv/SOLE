//mongodb connection
const mongoose = require('mongoose');

mongoose.connect('mongodb://0.0.0.0:27017/Sole');
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open',()=> console.log('Connected to Mongoose'));