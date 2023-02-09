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
router.get('/singleProduct/:id', sessionController.userBlocked,controller.singleProductpage);
//Profile
router.get('/profile', sessionController.userBlocked, controller.profile);
router.get('/editprofilepage/:id', sessionController.userBlocked,controller.editprofilepage);
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
router.get('/wishlist', sessionController.userBlocked, controller.wishlistPage);
//Cart
router.get('/cart', sessionController.userBlocked, controller.cartPage);
//Checkout
router.get('/checkout', sessionController.userBlocked, controller.checkoutPage);
//Order
router.get('/order_success', sessionController.userBlocked,controller.orderSuccess);
//Address
router.get('/addAddress', sessionController.userBlocked, controller.addAddressPage);

//************************** POST METHODS ************************//

router.post('/', controller.login);
//Otp
router.post('/otp', controller.otp);
router.post('/verifyotp', controller.verifyotp);
router.post('/resendotp', controller.resendotp);
//Forgot password
router.post('/resetPassword', controller.resetPassword);
router.post('/verifyPasswordOtp', controller.verifyPasswordOtp);
router.post('/setnewpassword', controller.settingpassword);
//Profile
router.post('/updateProfile/:id',controller.updateProfile);
//Search
router.post('/search', controller.search);
//Wishlist
router.post('/addToWishlist/:id', controller.wishlist);
router.post('/removeFromWishlist/:id', controller.removeFromWishlist);
//Cart
router.post('/removeFromCart', controller.removeFromCart);
router.post('/plusQuantity/:id', controller.cartIncrement);
router.post('/minusQuantity/:id', controller.cartDecrement);
//Coupon
router.post('/applyCoupon', controller.coupon);
router.post('/addToCart/:id', controller.cart);
//Address
router.post('/addAddress', controller.addAddress);
//Order
router.post('/user_order', controller.order);
//Payment
router.post('/verify_payment',controller.verifyPayment);
router.post("/paymentFailed", controller.paymentFailed);

module.exports = router