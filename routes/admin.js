const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const sessionController = require('../middlewares/sessionControl');

//************************** GET METHODS ************************//

router.get('/',controller.admin);
router.get("/adminhome", sessionController.adminSession, controller.home);
//Banner
router.get('/allBanner', sessionController.adminSession, controller.allBanner);
router.get("/addBannerPage", sessionController.adminSession, controller.addBannerPage);
router.get("/editbannerpage/:id", sessionController.adminSession, controller.editBannerPage);
//User
router.get("/alluser", sessionController.adminSession, controller.alluser);
//Product
router.get("/allproduct", sessionController.adminSession, controller.viewproduct);
router.get("/addproductpage", sessionController.adminSession, controller.addproductpage);
router.get("/editproductpage/:id", sessionController.adminSession, controller.editproductpage);
//Category
router.get("/category", sessionController.adminSession, controller.viewCategory);
router.get("/editcategorypage/:id", sessionController.adminSession, controller.editCategoryPage);
//Coupon
router.get('/allCoupon', sessionController.adminSession, controller.allCoupon);
router.get("/addCouponPage", sessionController.adminSession, controller.addCouponPage);
router.get("/editcouponpage/:id", sessionController.adminSession, controller.editCouponPage);
//Order
router.get("/allOrder", sessionController.adminSession, controller.allOrder);
//Testimony
router.get("/testimony", sessionController.adminSession, controller.viewTestimony);
router.get("/addtestimonypage", sessionController.adminSession, controller.addTestimonyPage);
router.get("/edittestimonypage/:id", sessionController.adminSession, controller.editTestimonyPage);
//logout
router.get("/adminlogout", controller.logout);

//************************** POST METHODS ************************//

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
//Testimony
router.post('/addTestimony', controller.addTestimony);
router.post("/updateTestimony/:id", controller.updateTestimony);
router.post("/testimonyUnblock/:id", controller.unblockTestimony);
router.post("/testimonyBlock/:id", controller.blockTestimony);
//Order
router.post('/status_change',controller.orderStatus)

module.exports = router