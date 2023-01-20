const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const ProductModel = require('../models/productModel');
const AdminModel = require('../models/adminModel');
const BannerModel = require('../models/bannerModel');
const CategoryModel = require('../models/categoryModel');
const TestimonyModel = require('../models/testimonyModel');
const CouponModel = require('../models/couponModel');
const OrderModel = require('../models/orderModel');



module.exports = {
    //LOGIN
    adminlogin: async (req, res) => {
        const { email, password } = req.body;
        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            console.log('Incorrect Admin Email');
            return res.redirect('/admin');
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log('Incorrect Admin Password');
            return res.redirect('/admin');
        }
        req.session.adminLogin = true;
        console.log('Admin LoggedIn');
        res.redirect('/admin/adminhome');
    },
    //LOGIN PAGE
    admin: (req, res) => {
        if (!req.session.adminLogin) {
            res.render('admin/login');
        } else {
            res.redirect('/admin/adminhome');
        }
    },
    //ADMIN HOME PAGE
    home: (req, res) => {
        if (req.session.adminLogin) {
            console.log('Entered Admin Homepage');
            res.render('admin/home');
        }
    },
    // LOG OUT
    logout: (req, res) => {
        req.session.loggedOut = true;
        req.session.destroy()
        console.log('Admin Loggedout');
        res.redirect('/admin')
    },

    // BANNER MANAGEMENT START

    //All Banner
    allBanner: async (req, res) => {
        const banners = await BannerModel.find({})
        console.log('Got all Banner');
        res.render('admin/viewBanner', { banners, index: 1 })
    },
    //Add Banner Page
    addBannerPage: async (req, res) => {
        console.log('Got add Bannerpage');
        res.render('admin/addBanner')
    },
    //Adding Banner
    addBanner: async (req, res) => {
        const { bannerName, description } = req.body
        const image = req.file;
        const newBanner = BannerModel({
            bannerName,
            description,
            image: image.filename,
        });
        await newBanner
            .save()
            .then(() => {
                console.log('Banner added');
                res.redirect("/admin/allBanner");
            })
            .catch((err) => {
                console.log(err.message);
                res.redirect("/admin/addBannerPage");
            });
    },
    //Delete Banner
    deletebanner: async (req, res) => {
        let id = req.params.id;
        await BannerModel.findByIdAndDelete({ _id: id });
        console.log('Banner Deleted');
        res.redirect("/admin/allBanner");
    },
    //Unblock Banner
    unblockBanner: async (req, res) => {
        let bannerId = req.params.id;
        await BannerModel.updateOne({ _id: bannerId }, { $set: { status: false } });
        console.log('Banner Unblocked');
        res.redirect("/admin/allBanner");
    },
    //Block Banner
    blockBanner: async (req, res) => {
        let bannerId = req.params.id;
        await BannerModel.updateOne({ _id: bannerId }, { $set: { status: true } });
        console.log('Banner Blocked');
        res.redirect("/admin/allBanner");
    },
    //Edit Banner
    editBannerPage: async(req,res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let banner = await BannerModel.findOne({ _id: id });
            console.log('Got Banner Editpage');
            res.render('admin/editBanner', { banner, admin: req.session.admin })
        }
    },
    //Update Banner
    updateBanner: async (req, res) => {
        const { bannerName, description } = req.body
        await BannerModel.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    bannerName,
                    description
                }
            }
        );
        if (req.file != null) {
            const image = req.file;
            console.log(image);
            await BannerModel.updateOne(
                { _id: req.params.id },
                {
                    $set: {
                        image: image.filename
                    }
                });
        }
        console.log('Banner Edited');
        // let item = await BannerModel.find({ _id: req.params.id });
        res.redirect('/admin/allBanner');
    },
    //BANNER MANAGEMENT END ok

    //USER MANAGEMENT START
    //View allUser
    alluser: async (req, res) => {
        const users = await UserModel.find({})
        res.render('admin/viewUser', { users, index: 1, admin: req.session.admin })

    },
    // Block User
    blockUser: async (req, res) => {
        const id = req.params.id
        await UserModel.findByIdAndUpdate({ _id: id }, { $set: { status: "Blocked" } })
            .then(() => {
                res.redirect('/admin/alluser')
            });
    },
    //Unblock User
    unblockUser: async (req, res) => {
        const id = req.params.id
        await UserModel.findByIdAndUpdate({ _id: id }, { $set: { status: "Unblocked" } })
            .then(() => {
                res.redirect('/admin/alluser')
            })
    },
    //user end

    //product start

    //view all products
    viewproduct: async(req,res) => {
        const page = parseInt(req.query.page) || 1;
        const items_per_page = 5;
        const totalproducts = await ProductModel.find().countDocuments();
        const products = await ProductModel.find().populate('category','category').sort({ date: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        // console.log(products);
        res.render('admin/viewProduct', {
            products, index: 1, admin: req.session.admin, page,
            hasNextPage: items_per_page * page < totalproducts,
            hasPreviousPage: page > 1,
            PreviousPage: page - 1,
        });
    },
    // PRODUCTS

    //add product page
    addproductpage: async (req, res) => {
        const category = await CategoryModel.find()
        if (req.session.adminLogin) {
            res.render('admin/addProduct', { category,admin: req.session.admin })
        }
    },
    //add products
    // addproduct: async (req, res) => {

    //     const {  productName, description, price, size } = req.body;

    //     const image = req.files;
    //     image.forEach(img => { });
    //     console.log(image);
    //     const productimages = image != null ? image.map((img) => img.filename) : null
    //     console.log(productimages)

    //     const newProduct = ProductModel({

    //         productName,
    //         description,
    //         price,
    //         size,
    //         // image: image.filename,
    //         image: productimages
    //     });
    //     console.log(newProduct)

    //     await newProduct
    //         .save()
    //         .then(() => {
    //             res.redirect("/admin/allproduct");
    //         }).catch((err) => {
    //             console.log(err.message);
    //             res.redirect("/admin/addproductpage");
    //         })
    //     },
    addproduct: async (req, res) => {
        console.log('entered addproduct');
        const { productName, description, price, size, date, category } = req.body
        // console.log(category);

        const image = req.file;
        console.log(image);

        const newProduct = ProductModel({
            productName,
            description,
            price,
            size,
            date,
            category,
            image: image.filename,
        });

        // console.log(category);
        // console.log(newProduct)

        await newProduct
            .save()
            .then(() => {
                res.redirect("/admin/allproduct");
            })
            .catch((err) => {
                console.log(err.message);
                res.redirect("/admin/addproductpage");
            });

    },
    // addproduct: async (req, res) => {
    //     const { productName, description, price, size, category } = req.body;
    //     console.log(category);
    //         const image = req.files;
    //         image.forEach(img => { });
    //         console.log(image);
    //         const productimages = image != null ? image.map((img) => img.filename) : null
    //         console.log(productimages)

    //         const newProduct = ProductModel({

    //             productName,
    //             description,
    //             price,
    //             size,
    //             category,
    //             // image: image.filename,
    //             image: productimages
    //         });
    //         console.log(newProduct)

    //         await newProduct
    //             .save()
    //             .then(() => {
    //                 res.redirect("/admin/allproduct");
    //             }).catch((err) => {
    //                 console.log(err.message);
    //                 res.redirect("/admin/addproductpage");
    //             });
    // },
    editproductpage: async (req, res) => {
        console.log('edit product');
        if (req.session.adminLogin) {
            const id = req.params.id
            let category = await CategoryModel.find()
            let product = await ProductModel.findOne({ _id: id })
            console.log(product)
            res.render('admin/editProduct', { product, category, admin: req.session.admin })
        }
    },
    //Update Product
    updateProduct: async (req, res) => {
        const { productName, description, price, size, date, category } = req.body


        await ProductModel.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    productName,
                    description,
                    price,
                    size,
                    date,
                    category
                }
            }
        );

        if (req.file != null) {
            const image = req.file;
            console.log(image);
            await ProductModel.updateOne(
                { _id: req.params.id },
                {
                    $set: {
                        image: image.filename
                    }
                });
        }
        let item = await ProductModel.find({ _id: req.params.id })
        console.log(item, 'hkdkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        res.redirect('/admin/allproduct');
    },
    unblockProduct: async (req, res) => {
        let productId = req.params.id;
        await ProductModel.updateOne({ _id: productId }, { $set: { status: false } });
        res.redirect("/admin/allproduct");
    },
    blockProduct: async (req, res) => {
        let productId = req.params.id;
        await ProductModel.updateOne({ _id: productId }, { $set: { status: true } });
        res.redirect("/admin/allproduct");
    },
    //CATEGORY START 
    viewCategory: async (req, res) => {
        const category = await CategoryModel.find();
        
        console.log('hi');
        console.log('category');
        res.render('admin/category', { category });

    },
    addCategory: async (req, res) => {
        console.log('entered to add category');
        const category = req.body.category
        // console.log(category);
        const newCategory = CategoryModel({ category });
        newCategory.save().then(res.redirect('/admin/category'));
    },
    deleteCategory: async (req, res) => {
        console.log('entered to delete category');
        const id = req.params.id
        console.log(id);
        await CategoryModel.findByIdAndDelete({ _id: id })
        console.log('deleted');
        res.redirect('/admin/category');
    },
    unblockCategory: async (req, res) => {
        let categoryId = req.params.id;
        await CategoryModel.updateOne({ _id: categoryId }, { $set: { status: false } });
        res.redirect("/admin/category");
    },
    blockCategory: async (req, res) => {
        let categoryId = req.params.id;
        await CategoryModel.updateOne({ _id: categoryId }, { $set: { status: true } });
        res.redirect("/admin/category");
    },
    editCategoryPage: async(req,res) => {
        if (req.session.adminLogin) {
            console.log('hi');
            const id = req.params.id
            console.log(id);
            let category = await CategoryModel.findOne({ _id: id });
            console.log('Got Category Editpage');
            res.render('admin/editCategory', { category, admin: req.session.admin });
        }
    },
    updateCategory: async (req, res) => {
        console.log('updated');
        const id=req.params.id
        const {category}= req.body

        await CategoryModel.updateOne(
            { _id: id },
            {
                $set: {
                    category:category
                }
            }
        );
        // let item = await CategoryModel.find({ _id: req.params.id })
        // console.log(item, 'hkdkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        res.redirect('/admin/category');
    },
    //COUPON
    allCoupon: async (req, res) => {
        console.log('got coupons');
        const coupons = await CouponModel.find({}).then((data) => {
            console.log('datas');
            console.log(data)
            let coupons = data
            res.render('admin/viewCoupon', { coupons, index: 1, admin: req.session.admin })
        })

    },
    addCouponPage: async (req, res) => {
        res.render('admin/addCoupon', { admin: req.session.admin })
    },
    addCoupon: async (req, res) => {

        const { couponCode, discount, minimumAmount, maximumDiscount, createdDate, expiryDate, times } = req.body

        const newCoupon = CouponModel({
            couponCode,
            discount,
            minimumAmount,
            maximumDiscount,
            createdDate,
            expiryDate,
            times,
        });
        console.log(newCoupon)

        await newCoupon
            .save()
            .then(() => {
                res.redirect("/admin/allCoupon");
            })
    },
    deleteCoupon: async (req, res) => {
        let id = req.params.id;
        await CouponModel.findByIdAndDelete({ _id: id });
        res.redirect("/admin/allCoupon")
    },
    unblockCoupon: async (req, res) => {
        let couponId = req.params.id;
        await CouponModel.updateOne({ _id: couponId }, { $set: { status: false } });
        res.redirect("/admin/allCoupon");
    },
    blockCoupon: async (req, res) => {
        let couponId = req.params.id;
        await CouponModel.updateOne({ _id: couponId }, { $set: { status: true } });
        res.redirect("/admin/allCoupon");
    },
    editCouponPage: async(req,res) => {
        console.log('edit coupon');
        if (req.session.adminLogin) {
            const id = req.params.id
            let coupon = await CouponModel.findOne({ _id: id })
            console.log(coupon)
            res.render('admin/editCoupon', { coupon, admin: req.session.admin })
        }
    },
    updateCoupon: async (req, res) => {

        const { couponCode, discount, minimumAmount, maximumDiscount, createdDate, expiryDate, times } = req.body

        await CouponModel.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    couponCode,
                    discount,
                    minimumAmount,
                    maximumDiscount,
                    createdDate,
                    expiryDate,
                    times
                }
            }
        );
        // let item = await CouponModel.find({ _id: req.params.id })
        // console.log(item, 'hkdkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        res.redirect('/admin/allCoupon');
    },
    //Order
    allOrder: async(req,res) =>{
        console.log('got all order');
        const orders = await OrderModel.find({});
        console.log(orders);
        res.render('admin/order', { orders, index: 1, admin: req.session.admin })
    },
    orderStatus: async(req,res) =>{
        let orderId = req.body.orderId
        let status  = req.body.status
        console.log(orderId);
        console.log(status);
        await OrderModel.findOneAndUpdate({_id:orderId},{$set:{
            orderStatus:status
        }})
    }
}
