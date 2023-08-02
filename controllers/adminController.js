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
    //********************************** SIGNIN START ***************************************//
    //Login page
    admin: (req, res) => {
        if (!req.session.adminLogin) {
            res.render('admin/login');
        } else {
            res.redirect('/admin/adminhome');
        }
    },
    //Login
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
    //Log out
    logout: (req, res) => {
        req.session.loggedOut = true;
        req.session.destroy()
        res.redirect('/admin')
    },
    //********************************** SIGNIN END ***************************************//

    //ADMIN HOME PAGE
    home: async(req, res) => {
            const users = await UserModel.find().countDocuments()
            const products = await ProductModel.find().countDocuments() 
            const orders = await OrderModel.find().countDocuments()
            res.render('admin/home', { users, products,  orders });
    },
    //****************************** BANNER MANAGEMENT START ****************************//

    //All Banner
    allBanner: async (req, res) => {
        const banners = await BannerModel.find({})
        res.render('admin/viewBanner', { banners, index: 1 })
    },
    //Add Banner Page
    addBannerPage: async (req, res) => {
        res.render('admin/addBanner')
    },
    //Add Banner
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
            const id = req.params.id
            let banner = await BannerModel.findOne({ _id: id });
            res.render('admin/editBanner', { banner, admin: req.session.admin })
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
    //****************************** BANNER MANAGEMENT END ****************************//

    //****************************** USER MANAGEMENT START ****************************//

    //View users
    alluser: async (req, res) => {
        const users = await UserModel.find({})
        res.render('admin/viewUser', { users, index: 1, admin: req.session.admin })
    },
    // Block user
    blockUser: async (req, res) => {
        const id = req.params.id
        await UserModel.findByIdAndUpdate({ _id: id }, { $set: { status: true } })
            .then(() => {
                res.redirect('/admin/alluser')
            });
    },
    //Unblock User
    unblockUser: async (req, res) => {
        const id = req.params.id
        await UserModel.findByIdAndUpdate({ _id: id }, { $set: { status: false } })
            .then(() => {
                res.redirect('/admin/alluser')
            })
    },
    //****************************** USER MANAGEMENT END ****************************//

    //*************************** PRODUCT MANAGEMENT START **************************//

    //View products
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
    //Add product page
    addproductpage: async (req, res) => {
        const category = await CategoryModel.find()
            res.render('admin/addProduct', { category,admin: req.session.admin })
    },
    //Add product
    addproduct: async (req, res) => {
        const { productName, description, price, size, date, category } = req.body
        const image = req.files;
        // eslint-disable-next-line no-unused-vars
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
    //Edit product
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
            await ProductModel.updateOne(
                { _id: req.params.id },
                {
                    $set: {
                        image: image.filename
                    }
                });
        }
        res.redirect('/admin/allproduct');
    },
    //Unblock product
    unblockProduct: async (req, res) => {
        let productId = req.params.id;
        await ProductModel.updateOne({ _id: productId }, { $set: { status: false } });
        res.redirect("/admin/allproduct");
    },
    //Block product
    blockProduct: async (req, res) => {
        let productId = req.params.id;
        await ProductModel.updateOne({ _id: productId }, { $set: { status: true } });
        res.redirect("/admin/allproduct");
    },
    //*************************** PRODUCT MANAGEMENT END **************************//

    //*************************** CATEGORY MANAGEMENT START ***********************//
    
    //View category
    viewCategory: async (req, res) => {
        const category = await CategoryModel.find();
        res.render('admin/category', { category });
    },
    //Add category
    addCategory: async (req, res) => {
        const category = req.body.category
        const existCategory = await CategoryModel.findOne({ category:category })
        if(existCategory != null){
            res.redirect('/admin/category')
        } else {
            const newCategory = CategoryModel({ category });
            newCategory.save().then(res.redirect('/admin/category'));
        }
    },
    //Delete category
    deleteCategory: async (req, res) => {
        const id = req.params.id
        await CategoryModel.findByIdAndDelete({ _id: id })
        res.redirect('/admin/category');
    },
    //Unblock category
    unblockCategory: async (req, res) => {
        let categoryId = req.params.id;
        await CategoryModel.updateOne({ _id: categoryId }, { $set: { status: false } });
        res.redirect("/admin/category");
    },
    //Block category
    blockCategory: async (req, res) => {
        let categoryId = req.params.id;
        await CategoryModel.updateOne({ _id: categoryId }, { $set: { status: true } });
        res.redirect("/admin/category");
    },
    //Edit category
    editCategoryPage: async(req,res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let category = await CategoryModel.findOne({ _id: id });
            res.render('admin/editCategory', { category, admin: req.session.admin });
        }
    },
    //Update category
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
    //*************************** CATEGORY MANAGEMENT END ***********************//

    //*************************** COUPON MANAGEMENT START ***********************//
    
    //View coupon
    allCoupon: async (req, res) => {
        await CouponModel.find({}).then((data) => {
            let coupons = data
            res.render('admin/viewCoupon', { coupons, index: 1, admin: req.session.admin })
        })
    },
    //Add coupon page
    addCouponPage: async (req, res) => {
        res.render('admin/addCoupon', { admin: req.session.admin })
    },
    //Add coupon
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
    //Delete coupon
    deleteCoupon: async (req, res) => {
        let id = req.params.id;
        await CouponModel.findByIdAndDelete({ _id: id });
        res.redirect("/admin/allCoupon")
    },
    //Unblock coupon
    unblockCoupon: async (req, res) => {
        let couponId = req.params.id;
        await CouponModel.updateOne({ _id: couponId }, { $set: { status: false } });
        res.redirect("/admin/allCoupon");
    },
    //Block coupon
    blockCoupon: async (req, res) => {
        let couponId = req.params.id;
        await CouponModel.updateOne({ _id: couponId }, { $set: { status: true } });
        res.redirect("/admin/allCoupon");
    },
    //Edit coupon
    editCouponPage: async(req,res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let coupon = await CouponModel.findOne({ _id: id })
            res.render('admin/editCoupon', { coupon, admin: req.session.admin })
        }
    },
    //Update coupon
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
    //*************************** COUPON MANAGEMENT END ***********************//

    //*************************** TESTIMONY MANAGEMENT START ***********************//

    //View testimony
    viewTestimony: async(req,res)=>{
        const testimony = await TestimonyModel.find()
        res.render('admin/testimony', { testimony, index: 1 });
    },
    //Add testimony page
    addTestimonyPage: async(req,res) =>{
        const testimony = await TestimonyModel.find()
        if (req.session.adminLogin) {
            res.render('admin/addTestimony', { testimony,admin: req.session.admin })
        }
    },
    //Add testimony
    addTestimony: async (req, res) => {
        const { name, description } = req.body
        const image = req.files;
        // eslint-disable-next-line no-unused-vars
        image.forEach(img => []);
        const testimonyImages = image != null ? image.map((img) => img.filename) : null;
        const newTestimony = TestimonyModel({
            name,
            description,
            image: testimonyImages,
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
    //Edit testimony
    editTestimonyPage: async (req, res) => {
        if (req.session.adminLogin) {
            const id = req.params.id
            let testimony = await TestimonyModel.findOne({ _id: id })
            res.render('admin/editTestimony', { testimony,admin: req.session.admin })
        }
    },
    //Upadate testimony
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
    //Unblock testimony
    unblockTestimony: async (req, res) => {
        let testimonyId = req.params.id;
        await TestimonyModel.updateOne({ _id: testimonyId  }, { $set: { status: false } });
        res.redirect("/admin/testimony");
    },
    //Block testimony
    blockTestimony: async (req, res) => {
        let testimonyId = req.params.id;
        await TestimonyModel.updateOne({ _id: testimonyId }, { $set: { status: true } });
        res.redirect("/admin/testimony");
    },
    //*************************** TESTIMONY MANAGEMENT END ***********************//


    //*************************** ORDER MANAGEMENT START ***********************//
    //View order
    allOrder: async(req,res) =>{
        const orders = await OrderModel.find({});
        // console.log(orders);
        res.render('admin/order', { orders, index: 1, admin: req.session.admin })
    },
    //Order status
    // eslint-disable-next-line no-unused-vars
    orderStatus: async(req,res) =>{
        let orderId = req.body.orderId
        let status  = req.body.status
        await OrderModel.findOneAndUpdate({_id:orderId},{$set:{
            orderStatus:status
        }})
    }
    //*************************** ORDER MANAGEMENT END ***********************//
}
