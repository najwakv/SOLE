/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const bcrypt = require('bcrypt');
// eslint-disable-next-line no-unused-vars
const { render } = require('ejs');
const nodemailer = require('nodemailer');
const UserModel = require('../models/userModel');
const ProductModel = require('../models/productModel');
const BannerModel = require('../models/bannerModel');
const CategoryModel = require('../models/categoryModel');
const TestimonyModel = require('../models/testimonyModel');
const CouponModel = require('../models/couponModel');
const CartModel = require('../models/cartModel');
const mongoose = require('mongoose');
const cartModel = require('../models/cartModel');
// eslint-disable-next-line no-unused-vars
const { findOneAndDelete, findOneAndUpdate } = require('../models/userModel');
const userModel = require('../models/userModel');
// eslint-disable-next-line no-unused-vars
const Objectid = mongoose.Types.ObjectId
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { nextTick } = require('process');


//********************************** START OTP *******************************************//
let FirstName;
let LastName;
let Email;
let Phone;
let Password;

// smtp initialising
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',
    auth: {
        // eslint-disable-next-line no-undef
        user: process.env.EMAIL,
        // eslint-disable-next-line no-undef
        pass: process.env.PSWD,
    }
});

// OTP Generating
let otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
//********************************** END OTP *******************************************//

//********************************** RAZORPAY ******************************************//
var instance = new Razorpay({
    key_id: "rzp_test_JNLKfIjgS0l3it",
    key_secret: "gBBWwEBxMziyqovi7vJz27Bo",
});

module.exports = {
    //User home page
   
    home: async (req, res) => {
        
            const products = await ProductModel.find({ status: false }).sort({ date: -1 }).limit(6)
            const banners = await BannerModel.find({ status: false })
            const testimony = await TestimonyModel.find({ status: false })
            const category = await CategoryModel.find({ status: false })
            if (req.session.userLogin) {
                res.render("user/home", { login: true, user: req.session.user, products, banners, testimony, category });
            } else {
                res.render('user/home', { login: false, products, banners, testimony, category });
            }
    },
    
    //User signin page
    signin: (req, res) => {
        if (!req.session.userLogin) {
            const emailError = req.session.emailError
            const passwordError = req.session.passwordError
            const blockError = req.session.blockError
            res.render('user/signin', { emailError, passwordError, blockError });
            req.session.destroy();
        } else {
            res.redirect('/')
        }
    },
    //User signup page
    signup: (req, res) => {
        const signupError = req.session.signupError
        res.render('user/signup', { signupError });
        req.session.destroy()
    },

    //********************************** USER SIGNUP START ****************************************//
    otp: async (req, res) => {
        FirstName = req.body.firstName
        LastName = req.body.lastName
        Email = req.body.email;
        Phone = req.body.phone
        Password = req.body.password

        const user = await UserModel.findOne({ email: Email });
        if (!user) {
            // mail content
            let mailOptions = {
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
        } else {
            req.session.signupError = true;
            res.redirect('/signup');
        }
    },
    //OTP verifiation
    verifyotp: (req, res) => {
        if (req.body.otp == otp) {
            const newUser = UserModel(
                {
                    firstName: FirstName,
                    lastName: LastName,
                    email: Email,
                    phone: Phone,
                    password: Password,
                }
            );
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
        } else {
            res.render('user/otp');
        }
    },
    //Resending
    resendotp: (req, res) => {
        let mailOptions = {
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
    //********************************** USER SIGN UP END *******************************************//

    //********************************** USER SIGN IN START *****************************************//
    login: async (req, res) => {
        const { email, password } = req.body;
        const userExist = await UserModel.findOne({ email: email });
        if (!userExist) {
            req.session.emailError = true
            return res.redirect('/signin');
        } else {
            if (userExist.status) {
                req.session.blockError = true
                return res.redirect('/signin');
            }
        }
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            req.session.passwordError = true
            return res.redirect('/signin');
        }
        req.session.user = userExist.firstName
        req.session.userId = userExist._id
        req.session.userLogin = true;
        res.redirect('/');
    },
    //********************************** USER SIGN IN END *******************************************//

    //********************************** FORGOT PASSWORD START **************************************//

    //Forgot password page
    forgotPassword: (req, res) => {
        res.render('user/forgotPassword');
    },
    //Reset password
    resetPassword: async (req, res) => {
        const userEmail = req.body;
        req.session.email = userEmail;
        const user = await UserModel.findOne({ $and: [{ email: userEmail.email }, { status: false }] });
        if (!user) {
            return res.redirect('/signin');
        } else {
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
                res.render('user/passwordOtp');
            });
        }
    },
    //Verify Password
    verifyPasswordOtp: (req, res) => {
        if (req.body.otp == otp) {
            res.render('user/newpassword');
        } else {
            res.render('user/passwordOtp');
        }
    },
    //New password
    settingpassword: async (req, res) => {
        let passOne = req.body.passwordOne;
        let passTwo = req.body.passwordTwo;
        if (passOne === passTwo) {
            let pass = await bcrypt.hash(passTwo, 10)
            let existUser = req.session.email;
            await UserModel.updateOne({ email: existUser.email }, { $set: { password: pass } });
            res.redirect('/signin');
        } else {
            res.render('user/newpassword');
        }
    },
    //********************************** FORGOT PASSWORD END **************************************//

    //***************************************** LOGOUT  *******************************************//
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/');
    },

    //********************************** PRODUCT START *******************************************//
    //All product page
    allProductPage: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const items_per_page = 9;
        const totalproducts = await ProductModel.find().countDocuments();
        const products = await ProductModel.find({ status: false }).sort({ date: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', {
                login: true, user: req.session.user, products, category,
                index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1,
            })
        } else {
            res.render('user/allProduct', {
                login: false, products, category, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1,
            })
        }
    },
    //Category product page
    categoryproductpage: async (req, res) => {
        let id = req.params.id
        const name = req.params.category
        const category = await CategoryModel.find({ status: false })
        const products = await ProductModel.find({ $and: [{ status: false }, { category: id }] }).populate('category', 'category')
        if (req.session.userLogin) {
            res.render('user/categoryProducts', { login: true, user: req.session.user, name, products, category })
        } else {
            res.render('user/categoryProducts', { login: false, name, products, category })
        }
    },
    //Single product page
    singleProductpage: async (req, res) => {
        const product = await ProductModel.findById({ _id: req.params.id })
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/singleProduct', { login: true, user: req.session.user, product, category })
        } else {
            res.render('user/singleProduct', { login: false, product, category })
        }
    },
    //********************************** PRODUCT END *******************************************//

    //********************************** PROFILE START *******************************************//
    //Profile
    profile: async (req, res) => {
        if (req.session.userLogin) {
            const id = req.session.userId;
            const userdetails = await UserModel.findById({ _id: id })
            const category = await CategoryModel.find({ status: false })
            res.render('user/profile', { login: true, user: req.session.user, userdetails, category })
        } else {
            res.redirect('/signin')
        }
    },
    //Edit profile
    editprofilepage: async (req, res) => {
        if (req.session.userLogin) {
            const id = req.params.id
            let profile = await UserModel.findById({ _id: id })
            const category = await CategoryModel.find({ status: false })
            res.render('user/editProfile', { login: true, user: req.session.user, profile, category })
        } else {
            res.redirect('/signin')
        }
    },
    //Update profile
    updateProfile: async (req, res) => {
        if (req.session.userLogin) {
            const { firstName, lastName, email, phone } = req.body;
            let details = await UserModel.findOneAndUpdate({ _id: req.params.id }, { $set: { firstName, lastName, email, phone } });
            await details.save()
                .then(() => {
                    res.redirect('/profile')
                })
        } else {
            res.redirect('/signin')
        }
    },
    //********************************** PROFILE END *******************************************//

    //********************************** SEARCH-SORT-FILTER START ******************************//
    //Search
    search: async (req, res) => {
        const searchQuery = req.body.search
        const search = await ProductModel.find({ $and: [{ status: false }, { productName: { $regex: searchQuery, '$options': 'i' } }] })
        const category = await CategoryModel.find({ status: false })
        if (search.length != 0) {
            if (req.session.userLogin) {
                res.render('user/search', { login: true, user: req.session.user, search, category, searchQuery })
            } else {
                res.render('user/search', { login: false, search, category, searchQuery })
            }
        } else {
            if (req.session.userLogin) {
                res.render('user/noSearch', { login: true, user: req.session.user, search, category })
            } else {
                res.render('user/noSearch', { login: false, search, category })
            }
        }
    },
    //Sort high to low
    sortHighToLow: async (req, res) => {
        const page = 1;
        const items_per_page = 9;
        const totalproducts = await ProductModel.find({ status: false }).countDocuments();
        const products = await ProductModel.find({ status: false }).sort({ price: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', {
                login: true, user: req.session.user, category,
                products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1,
            })
        } else {
            res.render('user/allProduct', {
                login: false, user: req.session.user, category,
                products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1,
            })
        }
    },
    //sort low to high
    sortLowToHigh: async (req, res) => {
        const page = 1;
        const items_per_page = 9;
        const totalproducts = await ProductModel.find({ status: false }).countDocuments();
        const products = await ProductModel.find({ status: false }).sort({ price: 1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', {
                login: true, user: req.session.user, category,
                products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1,
            })
        } else {
            res.render('user/allProduct', {
                login: false, category, products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1,
            })
        }
    },
    //Filter based on price
    filterOne: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 99, $gte: 0 } }] })
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterTwo: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 499, $gte: 100 } }] })
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterThree: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 999, $gte: 500 } }] })
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterFour: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 1999, $gte: 1000 } }] })
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterFive: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 3999, $gte: 2000 } }] })
        const category = await CategoryModel.find({ status: false })
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    //********************************** SEARCH-SORT-FILTER END ******************************//

    //********************************** WISHLIST START **************************************//
    //Add to wishlist
    wishlist: async (req, res) => {
        let productId = req.params.id
        let userId = req.session.userId
        if (req.session.userLogin) {
            const user = await UserModel.findOne({ _id: userId });
            let wishlist = user.wishlist
            let exist = false
            wishlist.forEach((w) => {
                if (w == productId) {
                    exist = true;
                }
            })
            if (exist) {
                res.json({ exist: true })
            } else {
                await UserModel.findOneAndUpdate({ _id: userId }, { $push: { wishlist: productId } });
                res.json({ added: true });
            }
        } else {
            res.json({ loginerr: true });
        }
    },
    //Wishlist Page
    wishlistPage: async (req, res) => {
        let login = req.session.userLogin
        let userId = req.session.userId
        const category = await CategoryModel.find({ status: false })
        if (login) {
            let userdata = await UserModel.find({ _id: userId }).populate('wishlist');
            let user = userdata[0]
            let wishlist = user.wishlist
            res.render('user/wishlist', { wishlist, category, login, user: req.session.user, index: 1 })
        } else {
            res.redirect('/signin')
        }
    },
    //Remove from wishlist
    removeFromWishlist: async (req, res) => {
        if (req.session.userLogin) {
            let productId = req.params.id
            let userId = req.session.userId;
            await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { wishlist: productId } })
                .then(() => {
                    res.redirect('/wishlist')
                })
        } else {
            res.redirect('/signin')
        }
    },
    //********************************** WISHLIST END *******************************************//

    //********************************** CART START *********************************************//
    //Cart page
    cartPage: async (req, res) => {
        let login = req.session.userLogin
        let userId = req.session.userId
        const category = await CategoryModel.find()
        const products = await ProductModel.find()
        if (login) {
            let Cart = await CartModel.findOne({ userId: userId })
            let CartData = await CartModel.findOne({ userId: userId }).populate('items.productId')
            if (Cart) {
                let cart = CartData.items
                let total = Cart.total
                let subTotal = Cart.subTotal
                res.render('user/cart', { cart, category, login, user: req.session.user, index: 1, products, total, subTotal })
            } else {
                let total = 0
                let cart = CartData
                res.render('user/cart', { cart, category, login, user: req.session.user, index: 1, products, total })
            }
        } else {
            res.redirect('/signin');
        }
    },
    //Add to cart
    cart: async (req, res) => {
        let productId = req.params.id
        let userId = req.session.userId
        const products = await ProductModel.find({ _id: productId })
        await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { wishlist: productId } })
        const product = products[0]
        let exist = false
        if (req.session.userLogin) {
            const cart = await CartModel.findOne({ userId });
            if (cart) {
                const proExist = cart.items
                proExist.forEach((element, index, array) => {
                    let productExist = element.productId.valueOf()
                    if (productExist == productId) {
                        exist = true
                    }
                })
                if (exist) {
                    res.json({ exist: true })
                } else {
                    await CartModel.findOneAndUpdate({ userId: userId }, {
                        $push: {
                            items:
                            {
                                productId: productId,
                                productPrice: product.price,
                                totalPrice: product.price
                            }
                        }
                    })
                    await CartModel.updateOne({ userId: userId }, { $inc: { total: product.price } })
                    await CartModel.updateOne({ userId: userId }, { $set: { subTotal: 0 } })
                    res.json({ added: true })
                }
            } else {
                const newCart = new CartModel({
                    userId: userId,
                    total: product.price,
                    items: [{
                        productId: productId,
                        productPrice: product.price,
                        totalPrice: product.price
                    }]
                })
                newCart.save()
                    .then(() => {
                        res.json({ added: true })
                    })
            }
        } else {
            res.json({ loginerr: true });
        }
    },
    //Remove from cart
    removeFromCart: async (req, res) => {
        if (req.session.userLogin) {
            let productId = req.body.id
            let userId = req.session.userId;
            let cart = await CartModel.findOne({ userId: userId })
            let items = cart.items
            let itemIndex = items.findIndex(
                (p) => p.productId == productId);
            let product = items[itemIndex]
            let productPrice = product.productPrice * product.quantity
            cart.total = cart.total - productPrice
            await cart.save()
            await CartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } } })
            await CartModel.updateOne({ userId: userId }, { $set: { subTotal: 0 } })
            res.json({ deleted: true })
        } else {
            res.redirect('/signin')
        }
    },
    //Cart increment
    cartIncrement: async (req, res) => {
        if (req.session.userLogin) {
            let prodId = req.params.id
            let quantity = 1;
            let userId = req.session.userId
            let cartData = await CartModel.find({ userId: userId })
            let cart = cartData[0]
            let items = cart.items
            let itemIndex = items.findIndex(
                (p) => p.productId == prodId);
            let product = items[itemIndex]
            product.quantity += quantity;
            product.totalPrice += product.productPrice
            cart.total += product.productPrice
            await CartModel.updateOne({ userId: userId }, { $set: { subTotal: 0 } })
            await cart.save().then(() => {
                res.json({ status: true })
            })
        } else {
            res.redirect('/signin')
        }
    },
    //Cart decrement
    cartDecrement: async (req, res) => {
        if (req.session.userLogin) {
            let prodId = req.params.id
            let quantity = 1;
            let userId = req.session.userId
            let cartData = await CartModel.find({ userId: userId })
            let cart = cartData[0]
            let items = cart.items
            let itemIndex = items.findIndex(
                (p) => p.productId == prodId);
            let product = items[itemIndex]
            let productPrice = product.productPrice
            product.quantity -= quantity;
            product.totalPrice -= product.productPrice
            cart.total -= product.productPrice
            if (product.quantity < 1) {
                await CartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: prodId } } })
                await CartModel.updateOne({ userId: userId }, { $set: { subTotal: 0 } })
                await CartModel.updateOne({ userId: userId }, { $inc: { total: -productPrice } }).then(() => {
                })
                res.json({ deleted: true })
            } else {
                await CartModel.updateOne({ userId: userId }, { $set: { subTotal: 0 } })
                await cart.save().then(() => {
                    res.json({ status: true })
                })
            }
        } else {
            res.redirect('/signin')
        }
    },
    //********************************** CART END *******************************************//

    //********************************** COUPON START **************************************//
    //Apply coupon
    coupon: async (req, res) => {
        const coupon = req.body.couponCode
        let userId = req.session.userId
        const cart = await CartModel.findOne({ userId: userId })
        let Discount = 0
        let Total = cart.total
        const couponData = await CouponModel.find({ $and: [{ couponCode: coupon }, { status: false }] })
        if (couponData.length!=0) {
            const couponDatas = couponData[0]
            if (couponDatas.times < couponDatas.limit) {
                if (couponDatas.expiryDate > Date.now()) {
                    if (Total >= couponDatas.minimumAmount) {
                        Discount = Total * 10 / 100
                        if (Discount > couponDatas.maximumDiscount) {
                            Discount = couponDatas.maximumDiscount
                        }
                        let finalAmount = Total - Discount
                        await CartModel.findOneAndUpdate({ userId: userId }, { $set: { subTotal: finalAmount } })
                        res.json({ apply: true })
                    } else {
                        res.json({ amount: true })
                    }
                } else {
                    res.json({ expiry: true })
                }
            } else {
                res.json({ limit: true })
            }
        } else {
            res.json({ exist: true }) 
        }
    },
    //********************************** COUPON END *******************************************//

    //********************************** CHECKOUT START ***************************************//
    //Checkout page
    checkoutPage: async (req, res) => {
        let userId = req.session.userId
        const category = await CategoryModel.find({ status:false })
        const products = await ProductModel.find({ status:false })
        let user = await userModel.findById({ _id: userId });
        let address = user.address
        let adressExist = address.length
        let cartData = await CartModel.find({ userId: userId })
        let cartTotal = cartData[0]
        let cartId = cartTotal._id.valueOf()
        if (req.session.userLogin) {
            res.render('user/checkout', { login: true, user: req.session.user, products, category, cartTotal, address, adressExist, cartId })
        } else {
            res.redirect('/signin')
        }
    },
    //Address page
    addAddressPage: async (req, res) => {
        const category = await CategoryModel.find({ status:false })
        const products = await ProductModel.find({ status:false })
        if (req.session.userLogin) {
            res.render('user/addAddress', { login: true, user: req.session.user, products, category, })
        } else {
            res.redirect('/signin')
        }
    },
    //Add address
    addAddress: async (req, res) => {
        let userId = req.session.userId
        let fullName = req.body.name
        let email = req.body.email
        let phone = req.body.phone
        let address = req.body.address
        let country = req.body.country
        let state = req.body.state
        let city = req.body.city
        let pincode = req.body.postal
        await UserModel.findByIdAndUpdate({ _id: userId }, {
            $push: {
                address:
                {
                    email: email,
                    phone: phone,
                    fullName: fullName,
                    address: address,
                    state: state,
                    city: city,
                    country: country,
                    pincode: pincode
                }
            }
        })
        res.redirect('/checkout');
    },
    //Order
    order: async (req, res) => {
        let userId = req.session.userId
        // eslint-disable-next-line no-unused-vars
        let logged = req.session.loginStatus
        let payment = req.body.paymentMethod
        let address = req.body.address
        console.log(address);
        let user = await userModel.findOne({ _id: userId })
        let deliveryAddress = user.address[address]
        let cart = await CartModel.findOne({ userId: userId })
        // eslint-disable-next-line no-unused-vars
        let productExist = cart.items
        let totalProduct = cart.items.length
        let status = payment === "cod" ? "Placed" : "Pending";
        let paymentStatus = payment === "cod" ? "Unpaid" : "Paid";
        let amount = cart.total
        const userOrder = {
            address: deliveryAddress,
            userId: userId,
            items: cart.items,
            paymentStatus: paymentStatus,
            orderStatus: status,
            paymentMethod: payment,
            totalProduct: totalProduct,
            totalAmount: amount,
        };
        // eslint-disable-next-line no-undef
        const orderId = await OrderModel.create(userOrder);
        if (payment == "Razorpay") {
            var options = {
                amount: amount * 100, // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId._id,
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({ order, userOrder, user })
                }
            });
        } else if (payment == 'cod') {
            await CartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], total: 0 } })
            res.json({ codSuccess: true })
        }
    },
    //Verify payment
    verifyPayment: async (req, res) => {
        console.log("inside verify");
        try {
            const userId = req.session.userId;
            await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], total: 0 } })
            let data = req.body
            console.log(data);
            console.log(data['payment[razorpay_order_id]'], 'payment.razorpay_order_id');
            let hmac = crypto
                .createHmac("sha256", "gBBWwEBxMziyqovi7vJz27Bo")
                .update(data.payment.razorpay_order_id + '|' + data.payment.razorpay_payment_id)
                .digest("hex");
            const orderId = data['orders[receipt]'];

            if (hmac == data.payment.razorpay_signature) {
                // eslint-disable-next-line no-undef
                await OrderModel.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            orderStatus: "Placed",
                        },
                    }
                );
                res.json({ status: true });
            } else {
                res.json({ status: false });
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    //Order success
    orderSuccess: async (req, res) => {
        if (req.session.userLogin) {
            res.redirect('/')
        } else {
            res.redirect('/login')
        }
    },
    //********************************** CHECKOUT END ***************************************//
}



