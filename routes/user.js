const express = require('express');
const { get } = require('mongoose');
const router = express.Router();
const controller = require('../controllers/userController');

//GET METHODS
router.get('/',controller.home);
router.get('/signin',controller.signin);
router.get('/logout', controller.logout);
router.get('/forgotpassword',controller.forgotpassword);

//post
router.post('/', controller.login);
router.post('/otp', controller.otp);
router.post('/resendotp', controller.resendotp);
router.post('/verifyotp', controller.verifyotp);
router.post('/resetpassword', controller.viewotppage);
router.post('/verifypasswordotp', controller.verifypasswordotp)

module.exports = router