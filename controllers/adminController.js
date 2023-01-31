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
            return res.redirect('/admin');
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.redirect('/admin');
        }
        req.session.adminLogin = true;
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
            res.render('admin/home');
        }
    },
    //LOG OUT
    logout: (req, res) => {
        req.session.loggedOut = true;
        req.session.destroy()
        res.redirect('/admin')
    },

    // BANNER MANAGEMENT START

    //All Banner
    allBanner: async (req, res) => {
        const banners = await BannerModel.find({})
        res.render('admin/viewBanner', { banners, index: 1 })
    },
    //Add Banner Page
    addBannerPage: async (req, res) => {
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
        res.redirect("/admin/allBanner");
    },
    //Unblock Banner
    unblockBanner: async (req, res) => {
        let bannerId = req.params.id;
        await BannerModel.updateOne({ _id: bannerId }, { $set: { status: false } });
        res.redirect("/admin/allBanner");
    },
    //Block Banner
    blockBanner: async (req, res) => {
        let bannerId = req.params.id;
        await BannerModel.updateOne({ _id: bannerId }, { $set: { status: true } });
        res.redirect("/admin/allBanner");
    },
    //Edit Banner
    editBannerPage: async(req,res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let banner = await BannerModel.findOne({ _id: id });
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
        res.redirect('/admin/allBanner');
    },
    //BANNER MANAGEMENT END 

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
    //USER MANAGEMENT END

    //PRODUCT MANAGEMENT START

    //view all products
    viewproduct: async(req,res) => {
        const page = parseInt(req.query.page) || 1;
        const items_per_page = 5;
        const totalproducts = await ProductModel.find().countDocuments();
        const products = await ProductModel.find().populate('category','category').sort({ date: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        res.render('admin/viewProduct', {
            products, index: 1, admin: req.session.admin, page,
            hasNextPage: items_per_page * page < totalproducts,
            hasPreviousPage: page > 1,
            PreviousPage: page - 1,
        });
    },
    //add product page
    addproductpage: async (req, res) => {
        const category = await CategoryModel.find()
        if (req.session.adminLogin) {
            res.render('admin/addProduct', { category,admin: req.session.admin })
        }
    },
    //add product
    addproduct: async (req, res) => {
        const { productName, description, price, size, date, category } = req.body
        const image = req.files;

        image.forEach(img => []);
        const productimages = image != null ? image.map((img) => img.filename) : null;

        const newProduct = ProductModel({
            productName,
            description,
            price,
            size,
            date,
            category,
            image: productimages
            // image: image.filename,
        });
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
    //edit product
    editproductpage: async (req, res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let category = await CategoryModel.find()
            let product = await ProductModel.findOne({ _id: id })
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
        res.redirect('/admin/allproduct');
    },
    //unblock product
    unblockProduct: async (req, res) => {
        let productId = req.params.id;
        await ProductModel.updateOne({ _id: productId }, { $set: { status: false } });
        res.redirect("/admin/allproduct");
    },
    //block product
    blockProduct: async (req, res) => {
        let productId = req.params.id;
        await ProductModel.updateOne({ _id: productId }, { $set: { status: true } });
        res.redirect("/admin/allproduct");
    },
    //PRODUCT MANAGEMENT END

    //CATEGORY MANAGEMENT START
    
    //view category
    viewCategory: async (req, res) => {
        const category = await CategoryModel.find();
        res.render('admin/category', { category });
    },
    //add category
    addCategory: async (req, res) => {
        const category = req.body.category
        const newCategory = CategoryModel({ category });
        newCategory.save().then(res.redirect('/admin/category'));
    },
    //delete category
    deleteCategory: async (req, res) => {
        const id = req.params.id
        await CategoryModel.findByIdAndDelete({ _id: id })
        res.redirect('/admin/category');
    },
    //unblock category
    unblockCategory: async (req, res) => {
        let categoryId = req.params.id;
        await CategoryModel.updateOne({ _id: categoryId }, { $set: { status: false } });
        res.redirect("/admin/category");
    },
    //block category
    blockCategory: async (req, res) => {
        let categoryId = req.params.id;
        await CategoryModel.updateOne({ _id: categoryId }, { $set: { status: true } });
        res.redirect("/admin/category");
    },
    //edit category
    editCategoryPage: async(req,res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let category = await CategoryModel.findOne({ _id: id });
            res.render('admin/editCategory', { category, admin: req.session.admin });
        }
    },
    //update category
    updateCategory: async (req, res) => {
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
        res.redirect('/admin/category');
    },
    //CATEGORY MANAGEMENT END

    //COUPON MANAGEMENT START
    //view coupon
    allCoupon: async (req, res) => {
        const coupons = await CouponModel.find({}).then((data) => {
            let coupons = data
            res.render('admin/viewCoupon', { coupons, index: 1, admin: req.session.admin })
        })
    },
    //add coupon page
    addCouponPage: async (req, res) => {
        res.render('admin/addCoupon', { admin: req.session.admin })
    },
    //add coupon
    addCoupon: async (req, res) => {
        const { couponCode, discount, minimumAmount, maximumDiscount, createdDate, expiryDate, limit } = req.body
        const newCoupon = CouponModel({
            couponCode,
            discount,
            minimumAmount,
            maximumDiscount,
            createdDate,
            expiryDate,
            limit,
        });        
        await newCoupon
            .save()
            .then(() => {
                res.redirect("/admin/allCoupon");
            })
    },
    //delete coupon
    deleteCoupon: async (req, res) => {
        let id = req.params.id;
        await CouponModel.findByIdAndDelete({ _id: id });
        res.redirect("/admin/allCoupon")
    },
    //unblock coupon
    unblockCoupon: async (req, res) => {
        let couponId = req.params.id;
        await CouponModel.updateOne({ _id: couponId }, { $set: { status: false } });
        res.redirect("/admin/allCoupon");
    },
    //block coupon
    blockCoupon: async (req, res) => {
        let couponId = req.params.id;
        await CouponModel.updateOne({ _id: couponId }, { $set: { status: true } });
        res.redirect("/admin/allCoupon");
    },
    //edit coupon
    editCouponPage: async(req,res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let coupon = await CouponModel.findOne({ _id: id })
            res.render('admin/editCoupon', { coupon, admin: req.session.admin })
        }
    },
    //update coupon
    updateCoupon: async (req, res) => {
        const { couponCode, discount, minimumAmount, maximumDiscount, createdDate, expiryDate, limit } = req.body
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
                    limit
                }
            }
        );
        res.redirect('/admin/allCoupon');
    },
    //COUPON MANAGEMENT END

    // TESTIMONY MANAGEMENT START
    viewTestimony: async(req,res)=>{
        const page = parseInt(req.query.page) || 1;
        const items_per_page = 5;
        const totaltestimony = await TestimonyModel.find().countDocuments();
        const testimony = await TestimonyModel.find().sort({ date: -1 }).skip((page - 1) * items_per_page).limit(items_per_page);
        res.render('admin/testimony', {
            testimony, index: 1, admin: req.session.admin, page,
            hasNextPage: items_per_page * page < totaltestimony,
            hasPreviousPage: page > 1,
            PreviousPage: page - 1,
        });
    },
    addTestimonyPage: async(req,res) =>{
        const testimony = await TestimonyModel.find()
        if (req.session.adminLogin) {
            res.render('admin/addTestimony', { testimony,admin: req.session.admin })
        }
    },
    addTestimony: async (req, res) => {
        const { name, description } = req.body
        const image = req.file;
        const newTestimony = TestimonyModel({
            name,
            description,
            image: image.filename,
        });
        await newTestimony
            .save()
            .then(() => {
                res.redirect("/admin/testimony");
            })
            .catch((err) => {
                console.log(err.message);
                res.redirect("/admin/addtestimonypage");
            });
    },
    editTestimonyPage: async (req, res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let testimony = await TestimonyModel.findOne({ _id: id })
            res.render('admin/editTestimony', { testimony,admin: req.session.admin })
        }
    },
    updateTestimony: async (req, res) => {
        const { name, description } = req.body
        await TestimonyModel.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    name,
                    description,
                }
            }
        );
        if (req.file != null) {
            const image = req.file;
            console.log(image);
            await TestimonyModel.updateOne(
                { _id: req.params.id },
                {
                    $set: {
                        image: image.filename
                    }
                });
        }
        res.redirect('/admin/testimony');
    },
    unblockTestimony: async (req, res) => {
        let testimonyId = req.params.id;
        await TestimonyModel.updateOne({ _id: testimonyId  }, { $set: { status: false } });
        res.redirect("/admin/testimony");
    },
    //block product
    blockTestimony: async (req, res) => {
        let testimonyId = req.params.id;
        await TestimonyModel.updateOne({ _id: testimonyId }, { $set: { status: true } });
        res.redirect("/admin/testimony");
    },

    //ORDER MANAGEMENT START
    //view order
    allOrder: async(req,res) =>{
        const orders = await OrderModel.find({});
        res.render('admin/order', { orders, index: 1, admin: req.session.admin })
    },
    //order status
    orderStatus: async(req,res) =>{
        let orderId = req.body.orderId
        let status  = req.body.status
        await OrderModel.findOneAndUpdate({_id:orderId},{$set:{
            orderStatus:status
        }})
    }
    //ORDER MANAGEMENT END
}
