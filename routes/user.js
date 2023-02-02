const express = require('express');
// const { get } = require('mongoose');
const router = express.Router();
const controller = require('../controllers/userController');
const userSession = require('../middlewares/userSession');
//GET METHODS
router.get('/', controller.home);
router.get('/signin', controller.signin);
router.get('/signup',controller.signup);
router.get('/logout', controller.logout);
router.get('/forgotPassword', controller.forgotPassword);
router.get('/allProductPage', controller.allProductPage);
router.get('/categoryProductsPage/:id/:category', controller.categoryproductpage);
router.get('/profile', userSession.userBlocked, controller.profile);
router.get('/editprofilepage/:id',controller.editprofilepage);
router.get('/search', controller.search);
router.get('/singleProduct/:id',controller.singleProductpage);
router.get('/sortHigh', controller.sortHighToLow);
router.get('/sortLow', controller.sortLowToHigh);
router.get('/0To99', controller.filterOne);
router.get('/100To499', controller.filterTwo);
router.get('/500To999', controller.filterThree);
router.get('/1000To1999', controller.filterFour);
router.get('/2000To3999', controller.filterFive);
router.get('/wishlist', controller.wishlistPage);
router.get('/cart', controller.cartPage);
router.get('/checkout', controller.checkoutPage);
router.get('/order_success',controller.orderSuccess);
router.get('/addAddress', controller.addAddressPage)

//post
router.post('/otp', controller.otp);
router.post('/verifyotp', controller.verifyotp);
router.post('/resendotp', controller.resendotp);
router.post('/', controller.login);
router.post('/resetPassword', controller.resetPassword);
router.post('/verifyPasswordOtp', controller.verifyPasswordOtp);
router.post('/setnewpassword', controller.settingpassword);
router.post('/updateProfile/:id',controller.updateProfile);
router.post('/search', controller.search);
router.post('/addToWishlist/:id', controller.wishlist);
router.post('/removeFromWishlist/:id', controller.removeFromWishlist);
router.post('/removeFromCart', controller.removeFromCart);
router.post('/applyCoupon', controller.coupon);
router.post('/addToCart/:id', controller.cart);
router.post('/plusQuantity/:id', controller.cartIncrement);
router.post('/minusQuantity/:id', controller.cartDecrement);
router.post('/addAddress', controller.addAddress);
router.post('/user_order', controller.order);
router.post('/verify_payment',controller.verifyPayment); 




module.exports = router