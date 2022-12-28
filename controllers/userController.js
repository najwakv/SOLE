const bcrypt = require('bcrypt');
const { render } = require('ejs');
const nodemailer = require('nodemailer');
const UserModel = require('../models/userModel');
const AdminModel = require('../models/adminModel');
const ProductModel = require('../models/productModel');
const BannerModel = require('../models/bannerModel');
const TestimonyModel = require('../models/testimonyModel');


var FirstName;
var LastName;
var Email;
var Phone;
var Password;

// smtp initialising

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user: 'testnajwatest@gmail.com',
        pass: 'ibfpkpxhccvtpshw',
    }
});

// OTP Generating

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

//OTP

module.exports = {
    //home 
    home: async (req, res) => {
        // res.send("You just created a User ...!!!");
        if (req.session.userLogin) {
            const products = await ProductModel.find()
            const banners = await BannerModel.find()
            const testimony = await TestimonyModel.find()
            res.render("user/home", { login: true, user: req.session.user, products, banners, testimony });
        } else {
            const products = await ProductModel.find()
            const banners = await BannerModel.find()
            const testimony = await TestimonyModel.find()
            res.render('user/home', { login: false, products, banners, testimony });
        }
    },
    //   SIGNUP
    otp: async (req, res) => {

        FirstName = req.body.firstName
        LastName = req.body.lastName
        Email = req.body.email;
        Phone = req.body.phone
        Password = req.body.password

        const user = await UserModel.findOne({ email: Email });

        if (!user) {
            // mail content
            var mailOptions = {
                to: req.body.email,
                subject: "Otp for registration is: ",
                html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                res.render('user/otp');
            });
        }
        else {
            console.log("mail in use");
            res.render('user/signin');
        }
    },
    //verifiation
    verifyotp: (req, res) => {
        if (req.body.otp == otp) {
            // res.send("You has been successfully registered");

            const newUser = UserModel(
                {
                    firstName: FirstName,
                    lastName: LastName,
                    email: Email,
                    phone: Phone,
                    password: Password,
                }
            );
            console.log(req.body);

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(() => {
                            res.redirect("/signin");
                        })
                        .catch((err) => {
                            console.log(err);
                            res.redirect("/signin")
                        })
                })
            })
        }
        else {
            res.render('user/otp');
        }
    },
    //resending
    resendotp: (req, res) => {
        var mailOptions = {
            to: Email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            res.render('user/otp');
        });
    },
    //   END SIGNUP

    //sign in
    login: async (req, res) => {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ $and: [{ email: email }, { status: "Unblocked" }] });
        if (!user) {
            return res.redirect('/signin');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/signin');
        }
        req.session.user = user.firstName
        req.session.userId = user._id
        req.session.userLogin = true;
        res.redirect('/');
    },

    signin: (req, res) => {
        if (!req.session.userLogin) {
            res.render('user/signin');
        } else {
            res.redirect('/')
        }
    },

    //forgot password
    forgotpassword:(req,res)=>{
        res.render('user/forgotpassword')
    },
    
    // LOG OUT
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/');
    },
    //otp page
    viewotppage: (req,res)=>{
        res.render('user/passwordotp')
    },
    //otp verification
    verifypasswordotp:(req,res)=>{
        res.render('user/newpassword');
    }
}


