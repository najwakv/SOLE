const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');


//GET METHODS
router.get('/',controller.admin);
router.get("/adminhome", controller.home);
router.get('/allBanner',controller.allBanner);
router.get("/addBannerPage", controller.addBannerPage);
router.get("/alluser", controller.alluser);
router.get("/allproduct", controller.viewproduct);
router.get("/addproductpage", controller.addproductpage);
router.get("/editproductpage/:id", controller.editproductpage);
router.get("/category", controller.viewCategory);
router.get('/allCoupon', controller.allCoupon);
router.get("/addCouponPage", controller.addCouponPage);
router.get("/allOrder", controller.allOrder);
router.get("/editcouponpage/:id", controller.editCouponPage);
router.get("/editbannerpage/:id", controller.editBannerPage);
router.get("/editcategorypage/:id", controller.editCategoryPage);
router.get("/testimony",controller.viewTestimony);
router.get("/addtestimonypage", controller.addTestimonyPage);
router.get("/edittestimonypage/:id", controller.editTestimonyPage);

//logout
router.get("/adminlogout", controller.logout);

//POST methods
router.post('/login', controller.adminlogin);

//Banner
router.post("/addBanner", controller.addBanner);
router.post("/deletebanner/:id", controller.deletebanner);
router.post("/bannerUnblock/:id", controller.unblockBanner);
router.post("/bannerBlock/:id", controller.blockBanner);
router.post("/updateBanner/:id", controller.updateBanner);

//User
router.post("/unblockUser/:id", controller.unblockUser);
router.post("/blockUser/:id", controller.blockUser);

//Product
router.post("/addproduct", controller.addproduct);
router.post("/updateProduct/:id", controller.updateProduct);
router.post("/productUnblock/:id", controller.unblockProduct);
router.post("/productBlock/:id", controller.blockProduct);

//Category
router.post("/addcategory", controller.addCategory);
router.post("/deletecategory/:id", controller.deleteCategory);
router.post("/categoryUnblock/:id", controller.unblockCategory);
router.post("/categoryBlock/:id", controller.blockCategory);
router.post("/updateCategory/:id", controller.updateCategory);



//Coupon
router.post("/addCoupon", controller.addCoupon);
router.post("/deleteCoupon/:id", controller.deleteCoupon);
router.post("/couponUnblock/:id", controller.unblockCoupon);
router.post("/couponBlock/:id", controller.blockCoupon);
router.post("/updateCoupon/:id", controller.updateCoupon);

//TESTIMONY
router.post('/addTestimony', controller.addTestimony);
router.post("/updateTestimony/:id", controller.updateTestimony);
router.post("/testimonyUnblock/:id", controller.unblockTestimony);
router.post("/testimonyBlock/:id", controller.blockTestimony);

//Orders
router.post('/status_change',controller.orderStatus)



module.exports = router