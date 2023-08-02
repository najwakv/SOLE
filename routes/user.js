const express = require('express');
// const { get } = require('mongoose');
const router = express.Router();
const controller = require('../controllers/userController');
const sessionController = require('../middlewares/sessionControl');

//************************** GET METHODS ************************//

router.get('/', controller.home);
router.get('/signin', controller.signin);
router.get('/signup',controller.signup);
router.get('/logout', controller.logout);
//Forgot password
router.get('/forgotPassword', controller.forgotPassword);
//Product
router.get('/allProductPage', sessionController.userBlocked, controller.allProductPage);
router.get('/categoryProductsPage/:id/:category', controller.categoryproductpage);
router.get('/singleProduct/:id', sessionController.userBlocked, controller.singleProductpage);
//Profile
router.get('/profile', sessionController.userBlocked, sessionController.userSession, controller.profile);
router.get('/editprofilepage/:id', sessionController.userBlocked, sessionController.userSession, controller.editprofilepage);
//Seach-Sort-Filter
router.get('/search', controller.search);
router.get('/sortHigh', controller.sortHighToLow);
router.get('/sortLow', controller.sortLowToHigh);
router.get('/0To99', controller.filterOne);
router.get('/100To499', controller.filterTwo);
router.get('/500To999', controller.filterThree);
router.get('/1000To1999', controller.filterFour);
router.get('/2000To3999', controller.filterFive);
//Wishlist
router.get('/wishlist', sessionController.userBlocked, sessionController.userSession, controller.wishlistPage);
//Cart
router.get('/cart', sessionController.userBlocked,  sessionController.userSession, controller.cartPage);
//Checkout
router.get('/checkout', sessionController.userBlocked, sessionController.userSession, controller.checkoutPage);
//Order
router.get('/order_success', sessionController.userBlocked, sessionController.userSession, controller.orderSuccess);
//Address
router.get('/addAddress', sessionController.userBlocked, sessionController.userSession, controller.addAddressPage);

//************************** POST METHODS ************************//

router.post('/', controller.login);
//Otp
router.post('/otp', controller.otp);
router.post('/verifyotp', controller.verifyotp);
router.post('/resendotp', controller.resendotp);
//Forgot password
router.post('/resetPassword', sessionController.userBlocked, controller.resetPassword);
router.post('/verifyPasswordOtp', sessionController.userBlocked,controller.verifyPasswordOtp);
router.post('/setnewpassword', sessionController.userBlocked, controller.settingpassword);
//Profile
router.post('/updateProfile/:id', sessionController.userBlocked, sessionController.userSession, controller.updateProfile);
//Search
router.post('/search', sessionController.userBlocked, controller.search);
//Wishlist
router.post('/addToWishlist/:id', sessionController.userBlocked, controller.wishlist);
router.post('/removeFromWishlist/:id', sessionController.userBlocked,sessionController.userSession, controller.removeFromWishlist);
//Cart
router.post('/removeFromCart', sessionController.userBlocked,sessionController.userSession, controller.removeFromCart);
router.post('/plusQuantity/:id', sessionController.userBlocked,sessionController.userSession, controller.cartIncrement);
router.post('/minusQuantity/:id', sessionController.userBlocked, sessionController.userSession, controller.cartDecrement);
//Coupon
router.post('/applyCoupon', sessionController.userBlocked, controller.coupon);
router.post('/addToCart/:id', sessionController.userBlocked, controller.cart);
//Address
router.post('/addAddress', sessionController.userBlocked, sessionController.userSession,controller.addAddress);
//Order
router.post('/user_order', sessionController.userBlocked, sessionController.userSession, controller.order);
//Payment
router.post('/verify_payment', sessionController.userBlocked, sessionController.userSession,controller.verifyPayment);
router.post("/paymentFailed", sessionController.userBlocked, sessionController.userSession, controller.paymentFailed);
//Track order
router.get("/trackOrder",sessionController.userSession, controller.trackOrder)

module.exports = router