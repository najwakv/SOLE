//mongodb connection
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://city-cabs:0000@cluster0.21mmzsj.mongodb.net/sole');
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open',()=> console.log('Connected to Mongoose'));