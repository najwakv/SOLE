//mongodb connection
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Sole:12345@cluster0.eehuhsw.mongodb.net/cluster0?retryWrites=true&w=majority');
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open',()=> console.log('Connected to Mongoose'));