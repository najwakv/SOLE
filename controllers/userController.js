const bcrypt = require('bcrypt');
const { render } = require('ejs');
const nodemailer = require('nodemailer');
const UserModel = require('../models/userModel');
const AdminModel = require('../models/adminModel');
const ProductModel = require('../models/productModel');
const BannerModel = require('../models/bannerModel');
const CategoryModel = require('../models/categoryModel');
const TestimonyModel = require('../models/testimonyModel');
const CouponModel = require('../models/couponModel');



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
            const products = await ProductModel.find({ status: false }).sort({ date: -1 }).limit(6)
            const banners = await BannerModel.find({ status: false })
            const testimony = await TestimonyModel.find()
            const category =await CategoryModel.find({ status: false })
            res.render("user/home", { login: true, user: req.session.user, products, banners, testimony, category });
        } else {
            const products = await ProductModel.find({ status: false }).sort({ date: -1 }).limit(6)
            const banners = await BannerModel.find({ status: false })
            const testimony = await TestimonyModel.find()
            const category =await CategoryModel.find({ status: false })
            res.render('user/home', { login: false, products, banners, testimony, category });
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
            req.session.signupError = true;
            res.redirect('/signup');
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
    //sign in
    login: async (req, res) => {
        const { email, password } = req.body;
        const userexist = await UserModel.findOne({ email: email });
        if (!userexist) {
            req.session.emailError = true
            return res.redirect('/signin');
        }else{
            console.log('entered block');
            const user = userexist.status
            console.log(user);
            if(user =='Blocked'){
                console.log('blocked');
                req.session.blockError = true
                return res.redirect('/signin');
            }
        }
        const isMatch = await bcrypt.compare(password, userexist.password);
        if (!isMatch) {
            req.session.passwordError = true
            return res.redirect('/signin');
        }
        req.session.user = userexist.firstName
        req.session.userId = userexist._id
        req.session.userLogin = true;
        res.redirect('/');
    },

    signin: (req, res) => {
        if (!req.session.userLogin) {
            console.log('sign in');
            emailError = req.session.emailError
            passwordError = req.session.passwordError
            blockError = req.session.blockError
            res.render('user/signin',{emailError, passwordError, blockError});
            req.session.destroy();
        } else {
            res.redirect('/')
        }
    },

    signup: (req, res) => {
        signupError = req.session.signupError
        res.render('user/signup', { signupError });
        req.session.destroy()
    },
//forgot password start
    forgotpassword: (req, res) => {
        console.log('got forgot password');
        res.render('user/forgotpassword');
    },

    resetpassword: async (req, res) => {
        console.log('entered resetpassword');
        const userEmail = req.body;
        req.session.email = userEmail;
        console.log(userEmail);
        console.log('got user email');
        const user = await UserModel.findOne({ $and: [{ email: userEmail.email }, { status: "Unblocked" }] });
        console.log('found user');
        if (!user) {
            return res.redirect('/signin');
        } else {
            // mail content
            var mailOptions = {
                to: req.body.email,
                subject: "Otp for registration is: ",
                html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
            };
            console.log('mail generated');
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                console.log('mail send');
                res.render('user/passwordotp');
                console.log('got otp page');
            });
        }
    },

    verifypasswordotp: (req, res) => {
        console.log('setting new password');
        if (req.body.otp == otp) {
            console.log('correct otp');
            res.render('user/newpassword');
        } else {
            console.log('incorrect otp');
            res.render('user/passwordotp');
        }
        // res.render('user/newpassword');
    },

    settingpassword: async (req, res) => {
        Pass1 = req.body.password1;
        Pass2 = req.body.password2;
        console.log(Pass1);
        console.log(Pass2);
        if (Pass1 === Pass2) {

            pass = await bcrypt.hash(Pass2, 10)
            console.log('password :' + pass);

            console.log('checked password');
            console.log(req.session.email);
            existUser = req.session.email;
            const updateUser = await UserModel.updateOne({ email: existUser.email }, { $set: { password: pass } });
            console.log(updateUser);
            res.redirect('/signin');

        } else {
            console.log('incorrect pass');
            res.render('user/newpassword');
        }
        // console.log('redirect to signin page');

    },
//forgot password end

    // LOG OUT
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/');
    },
    //PRODUCT
    //all product
    allproductpage: async(req,res) => {
        const products = await ProductModel.find({ status: false }).sort({ date: -1 });
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, products, category })
        }else {
            res.render('user/allProduct', { login: false, products, category})
    
        }
    },
    categoryproductpage: async(req,res) => {
        console.log('reached category');
        if (req.session.userLogin) {
            id = req.params.id
            console.log(id);
            console.log('got id');
            const name = req.params.category
            console.log(name);
            console.log('got category');
            const category = await CategoryModel.find({ status: false })
            console.log(category);
            const products = await ProductModel.find({ category:name}).populate('category','category')
            console.log(products);
            res.render('user/categoryProducts', { login: true, user: req.session.user, name, products, category })
          }
          else {
            id = req.params.id
            console.log(id);
            console.log('got id');
            const name = req.params.category
            console.log(name);
            console.log('got category');
            const category = await CategoryModel.find({ status: false })
            console.log(category);
            const products = await ProductModel.find({$and: [{status: false}, {category:id}]}).populate('category','category')
            console.log(products);
            res.render('user/categoryProducts', { login: false, name, products, category })
            
          }
    }
}


