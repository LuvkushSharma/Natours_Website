const express = require('express');
const path = require('path');
const viewsController = require(path.join(__dirname , '../Controllers/viewsController'));
const authController = require(path.join(__dirname , './../Controllers/authController'));

const bookingController = require(path.join(__dirname , './../Controllers/bookingController'));

const router = express.Router();

router.use(viewsController.alerts);

// router.get ('/' , authController.isLoggedIn , viewsController.getOverview);

// ------------ Lec_16 -----------

router.get ('/' , bookingController.createBookingCheckout , authController.isLoggedIn , viewsController.getOverview);

///////////////////////////////////////

router.get('/tour/:slug' , authController.isLoggedIn , viewsController.getTour);
router.get('/login' , authController.isLoggedIn , viewsController.getLoginForm);
router.get('/signup' , authController.isLoggedIn , viewsController.getSignUpForm);

router.get('/me' , authController.isLoggedIn , authController.protect , viewsController.getAccount);

// --------------- Lec_17 -------------

router.get('/my-tours' , authController.protect , viewsController.getMyTours);

//////////////////////////////////////////

router.post('/submit-user-data' , authController.protect ,viewsController.updateUserData);

module.exports = router;