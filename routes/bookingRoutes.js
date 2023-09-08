const express = require ("express");
const path = require ('path');
const authController = require(path.join(__dirname , './../Controllers/authController'));

const bookingController = require(path.join(__dirname , './../Controllers/bookingController'));

const router = express.Router();

router.get('/checkout-session/:tourId' , authController.protect , bookingController.getCheckoutSession);


module.exports = router;  


