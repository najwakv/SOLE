const mongoose = require('./configuration/connection');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');

//routers
const homeRoute = require('./routes/user');
const adminRoute = require('./routes/admin');

const app = express();

//set view-engine
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(express.json());
app.use(express.urlencoded({extented:false}));
app.use(cookieParser());

// Multer (file upload setup)
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "public/images/cardigans/");
    },
    filename: (req,file,cb) => {
        cb(null,file.fieldname +"_" + Date.now() + path.extname(file.originalname))
        console.log(file.fieldname + Date.now() + path.extname(file.originalname));
    },
});
//using multer
app.use(multer({storage: storage}).single("image"));

//session
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
}));

//CACHE CONTROL
app.use((req, res, next) => {
    res.set("Cache-Control", "private,no-cache,no-store,must-revalidate");
    next();
});

//user router
app.use('/',homeRoute);

//admin router
app.use('/admin',adminRoute);

//server creation
app.listen(4000,()=>{
    console.log('connected to port 4000');
});