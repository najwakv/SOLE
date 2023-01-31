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
const CartModel = require('../models/cartModel');
const mongoose = require('mongoose');
const cartModel = require('../models/cartModel');
const { findOneAndDelete, findOneAndUpdate } = require('../models/userModel');
const userModel = require('../models/userModel');
const Objectid = mongoose.Types.ObjectId

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
        user: 'testnajwatest@gmail.com',
        pass: 'ibfpkpxhccvtpshw',
    }
});
// 'testnajwatest@gmail.com'
// OTP Generating

let otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);
//********************************** END OTP *******************************************//

module.exports = {
    //User home page 
    home: async (req, res) => {
        if (req.session.userLogin) {
            const products = await ProductModel.find({ status: false }).sort({ date: -1 }).limit(6)
            const banners = await BannerModel.find({ status: false })
            const testimony = await TestimonyModel.find()
            const category = await CategoryModel.find({ status: false })
            res.render("user/home", { login: true, user: req.session.user, products, banners, testimony, category });
        } else {
            const products = await ProductModel.find({ status: false }).sort({ date: -1 }).limit(6)
            const banners = await BannerModel.find({ status: false })
            const testimony = await TestimonyModel.find()
            const category = await CategoryModel.find({ status: false })
            res.render('user/home', { login: false, products, banners, testimony, category });
        }
    },
    //User signin page
    signin: (req, res) => {
        if (!req.session.userLogin) {
            emailError = req.session.emailError
            passwordError = req.session.passwordError
            blockError = req.session.blockError
            res.render('user/signin', { emailError, passwordError, blockError });
            req.session.destroy();
        } else {
            res.redirect('/')
        }
    },
    //User signup page
    signup: (req, res) => {
        signupError = req.session.signupError
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
        }
        else {
            console.log("mail in use");
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
        }
        else {
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
        const userexist = await UserModel.findOne({ email: email });
        if (!userexist) {
            req.session.emailError = true
            return res.redirect('/signin');
        } else {
            const user = userexist.status
            if (user == 'Blocked') {
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
        const user = await UserModel.findOne({ $and: [{ email: userEmail.email }, { status: "Unblocked" }] });
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
                res.render('user/passwordOtp');
                console.log('got otp page');
            });
        }
    },

    verifypasswordotp: (req, res) => {
        if (req.body.otp == otp) {
            res.render('user/newpassword');
        } else {
            res.render('user/passwordOtp');
        }
    },

    settingpassword: async (req, res) => {
        Pass1 = req.body.password1;
        Pass2 = req.body.password2;
        if (Pass1 === Pass2) {
            pass = await bcrypt.hash(Pass2, 10)
            existUser = req.session.email;
            const updateUser = await UserModel.updateOne({ email: existUser.email }, { $set: { password: pass } });
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
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, products, category,
                index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1,
            })
        } else {
            res.render('user/allProduct', { login: false, products, category,index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1, })
        }
    },
    //Category product page
    categoryproductpage: async (req, res) => {
        id = req.params.id
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
        id = req.params.id
        const category = await CategoryModel.find()
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
            const category = await CategoryModel.find()
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
            const category = await CategoryModel.find()
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
        }
        else {
            res.redirect('/signin')
        }
    },
    //********************************** PROFILE END *******************************************//

    //********************************** SEARCH-SORT-FILTER START ******************************//
    //Search
    search: async (req, res) => {
        const searchQuery = req.body.search
        const search = await ProductModel.find({ productName: { $regex: searchQuery, '$options': 'i' } })
        const category = await CategoryModel.find()
        if (search.length != 0) {
            if (req.session.userLogin) {
                res.render('user/search', { login: true, user: req.session.user, search, category, searchQuery })
            } else {
                res.render('user/search', { login: false, user: req.session.user, search, category, searchQuery })
            }
        } else {
            if (req.session.userLogin) {
                res.render('user/noSearch', { login: true, user: req.session.user, search, category })
            } else {
                res.render('user/noSearch', { login: false, user: req.session.user, search, category })
            }
        }

    },
    //Sort high to low
    sortHighToLow: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const items_per_page = 9;
        const totalproducts = await ProductModel.find().countDocuments();
        const products = await ProductModel.find({}).sort({ price: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1, })
        } else {
            res.render('user/allProduct', { login: false, user: req.session.user, category, products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1, })
        }
    },
    //sort low to high
    sortLowToHigh: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const items_per_page = 9;
        const totalproducts = await ProductModel.find().countDocuments();
        const products = await ProductModel.find({}).sort({ price: 1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1, })
        } else {
            res.render('user/allProduct', { login: false, category, products, index: 1, page,
                hasNextPage: items_per_page * page < totalproducts,
                hasPreviousPage: page > 1,
                PreviousPage: page - 1, })
        }
    },
    //Filter based on price
    filterOne: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 99, $gte: 0 } }] })
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterTwo: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 499, $gte: 100 } }] })
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterThree: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 999, $gte: 500 } }] })
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterFour: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 1999, $gte: 1000 } }] })
        const category = await CategoryModel.find()
        if (req.session.userLogin) {
            res.render('user/allProduct', { login: true, user: req.session.user, category, products })
        } else {
            res.render('user/allProduct', { login: false, category, products })
        }
    },
    filterFive: async (req, res) => {
        const products = await ProductModel.find({ $and: [{ status: false }, { price: { $lte: 3999, $gte: 2000 } }] })
        const category = await CategoryModel.find()
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
        if (req.session.userLogin) {
            let productId = req.params.id
            let userId = req.session.userId
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
        const category = await CategoryModel.find()
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
    //Add to cart from wishlist
    // addToCart: async (req, res) => {
    //     let productId = req.params.id
    //     let userId = req.session.userId
    //     const products = await ProductModel.find({ _id: productId })
    //     const product = products[0]
    //     let exist = false
    //     if (req.session.userLogin) {
    //         const cart = await CartModel.findOne({ userId });
    //         if (cart) {
    //             const proExist = cart.items
    //             console.log(proExist);
    //             proExist.forEach((element, index, array) => {
    //                 let productExist = element.productId.valueOf()
    //                 console.log(productExist);
    //                 if (productExist == productId) {
    //                     exist = true
    //                 }
    //             })
    //             if (exist) {
    //                 await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { wishlist: productId } })
    //                 return res.redirect('/cart');
    //             } else {
    //                 await CartModel.findOneAndUpdate({ userId: userId }, {
    //                     $push: {
    //                         items:
    //                         {
    //                             productId: productId,
    //                             productPrice: product.price,
    //                             // totalPrice: product.price
    //                         }
    //                     }
    //                 }
                    
    //                 )
                    // console.log('two');
                    // await CartModel.updateOne({ userId: userId }, { $inc: { total: product.price } })
                    // res.json({ added: true })
            //     }
            // }
            // else {
                // console.log(productId, 'or here');
                // const newCart = new CartModel({
                //     userId: userId,
                //     total: product.price,
                //     items: [{
                //         productId: productId,
                //         productPrice: product.price,
                //         // totalPrice: product.price
                //     }]
                // })
                // console.log('three');
                // newCart.save()
                    // .then(() => {
                        // res.json({ added: true })
    //                     res.redirect('/cart')
    //                 })
    //         }
    //         await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { wishlist: productId } })
    //             .then(() => {
    //                 res.redirect('/wishlist')
    //             })
    //     } else {
    //         res.json({ loginerr: true });
    //     }
    // },
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
           
            


            if(Cart){
                let total = Cart.total
                    // console.log(Cart);
            // console.log(CartData);
            let cart = CartData.items
            
            let najwa = cart.length
            let sum = 0
            // for (let i = 0; i < najwa; i++) {
            //     sum = sum + cart[i].productId.price
            // }
            // console.log(sum);
            // console.log(Cart.total);
            // Cart.total = sum
            // console.log(Cart.total);
            // await CartModel.findOneAndUpdate({ userId: userId },{$set :{total:sum}})
            // console.log(Cart.total);
            // for (let i = 0; i < najwa; i++) {
            //     cartTotal = cartTotal + cart[i].productPrice
            // }
            // let x = parseInt(cartTotal)
            res.render('user/cart', { cart, category, login, user: req.session.user, index: 1, products,total })
            }else{
                let total = 0
                console.log('no cart');
                let cart = CartData
                console.log(cart);
                let sum=0
                res.render('user/cart', { cart, category, login, user: req.session.user, index: 1, products, total })
            }
        }else{
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
                    }
                    )
                    // console.log(cart)
                    await CartModel.updateOne({ userId: userId }, { $inc: { total: product.price } })
                    res.json({ added: true })
                }
            }
            else {
                console.log(productId, 'or here');
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
            let productId = req.params.id
            let userId = req.session.userId;
            await CartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } } })
                .then(() => {
                    res.redirect('/cart')
                })
        } else {
            res.redirect('/signin')
        }
    },
    //Cart increment
    cartIncrement: async(req,res) => {    
        if(req.session.userLogin){
            let prodId = req.params.id
            let quantity = 1;
            let userId = req.session.userId
            let cartdata = await CartModel.find({userId : userId})
            let cart = cartdata[0]
            let items = cart.items
            let itemIndex = items.findIndex(
                (p) => p.productId == prodId);
            let product = items[itemIndex]
             product.quantity += quantity;
             product.totalPrice += product.productPrice

            //  console.log(items)
             cart.total += product.productPrice

             await cart.save().then(()=>{
                res.json({status:true})
             })
        } else {
            res.redirect('/signin')
        }    
    },
    cartDecrement: async(req,res) => {
        if(req.session.userLogin){
            let prodId = req.params.id
            let quantity = 1;
            let userId = req.session.userId
            let cartdata = await CartModel.find({userId : userId})
            let cart = cartdata[0]
            // console.log(cart);
            let items = cart.items
            let itemIndex = items.findIndex(
                (p) => p.productId == prodId);
            let product = items[itemIndex]
            // console.log(product.quantity);
            // console.log(product.productPrice);
            let productPrice = product.productPrice
            product.quantity -= quantity;
            product.totalPrice -= product.productPrice
            //  console.log(items)
             cart.total -= product.productPrice
             if(product.quantity < 1){
                await CartModel.findOneAndUpdate({ userId:userId},{$pull: { items : { productId : prodId}}})
                await CartModel.updateOne({ userId:userId},{$inc:{ total:-productPrice }}).then(()=>{
                    // console.log('success sufiyan');
                })
                res.json({deleted:true})
             }else{
                await cart.save().then(()=>{
                    res.json({status:true})
                 })
             }
        } else {
            res.redirect('/signin')
        }
    },
    //********************************** CART END *******************************************//


    //checkout

    checkoutPage: async(req,res) =>{
        
        let userId = req.session.userId
        const category = await CategoryModel.find()
        const products = await ProductModel.find()
        let user = await userModel.findById({ _id: userId });
        let address = user.address
        let adressExist = address.length
        // console.log(address);
        let cartData = await CartModel.find( { userId: userId } )
        // console.log(cartData[0]);

        let cartTotal = cartData[0]
        let cartId = cartTotal._id.valueOf()
        console.log(cartId);
        // console.log(coupons);
        if(req.session.userLogin){
            res.render('user/checkout', { login: true, user: req.session.user, products, category, cartTotal, address, adressExist, cartId  })
        } else {
            res.redirect('/signin')
        }
    },
    addAddress: async(req,res)=>{
        let userId = req.session.userId
        let email = req.body.email
        let phone = req.body.phone
        let fullName = req.body.name
        let address = req.body.address
        let city = req.body.city
        let country = req.body.country
        let pincode = req.body.postal
        // console.log(email);
        // console.log(phone);
        // console.log(fullName);
        // console.log(address);
        // console.log(city);
        // console.log(country);
        // console.log(pincode);
        await UserModel.findByIdAndUpdate({ _id: userId },{$push: {
            address:
            {
              email: email,
              phone: phone,
              fullName: fullName,
              address: address,
              city: city,
              country: country,
              pincode: pincode  
            }
        }})
    },
    //Order
    order: async (req, res) => {
        
    },

    //********************************** COUPON START ***************************************//
    //Apply coupon
    coupon: async (req, res) => {   

        // const coupon = req.body.couponCode
        let userId = req.session.userId
        console.log(coupon);
        const cart = await CartModel.findOne({ userId: userId })
        let Discount = 0
        let Total = cart.total
        console.log(cart.total);
        const couponData = await CouponModel.find({ $and: [{ couponCode: coupon }, { status: false }] })
        // console.log(couponData);
        const couponDatas = couponData[0]
        console.log(couponDatas);
        if (couponDatas.times < couponDatas.limit) {
            // console.log(couponDatas.times);
            // console.log(couponDatas.limit);
            if (couponDatas.expiryDate > Date.now()) {
                console.log('entered date');
                if( Total >= couponDatas.minimumAmount){
                    console.log('success');
                    Discount = Total*10/100
                    if(Discount > couponDatas.maximumDiscount){
                        Discount = couponDatas.maximumDiscount
                        // console.log(Discount);
                    }
                    console.log(Discount);
                    let finalAmount = Total-Discount
                    console.log(finalAmount);
                    await CartModel.findOneAndUpdate({ userId: userId },{$set :{ subTotal:finalAmount }})
                    res.json({ apply:true })
                } else {
                    console.log('no minimum amount');
                }
            } else {
                console.log('expiry date ');
            }
        } else {
            console.log('limit exceeded');
        }
    },
    //********************************** COUPON END *******************************************//
}



