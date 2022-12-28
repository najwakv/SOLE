const express = require('express');
const { get } = require('mongoose');
const router = express.Router();
const controller = require('../controllers/userController');

//GET METHODS
router.get('/', controller.home);
router.get('/signin', controller.signin);
router.get('/signup',controller.signup);
router.get('/logout', controller.logout);
router.get('/forgotpassword', controller.forgotpassword);
router.get('/allproductpage', controller.allproductpage);
router.get('/categoryProductspage/:id/:category', controller.categoryproductpage);

//post
router.post('/', controller.login);
router.post('/otp', controller.otp);
router.post('/resendotp', controller.resendotp);
router.post('/verifyotp', controller.verifyotp);
router.post('/resetpassword', controller.resetpassword);
router.post('/verifypasswordotp', controller.verifypasswordotp);
router.post('/setnewpassword', controller.settingpassword)

module.exports = router