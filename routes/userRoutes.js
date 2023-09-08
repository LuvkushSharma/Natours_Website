const express = require('express');
const path = require('path');

// const multer = require('multer');

const userController = require(path.join(
  __dirname,
  "../Controllers/userController.js"
));


const authController = require(path.join(
  __dirname,
  "../Controllers/authController"
));


// ------------ Lec_1 ------------

// Passing object of options and this time only destination.
// const upload = multer ({dest : 'public/img/users'});


/////////////////////////////////

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

// ---------- Lec-14 ------------

router.route('/logout').get(authController.logout);

// Now go to the login.js in the js folder.

/////////////////////////////////

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);


router.route('/updateMyPassword').patch(authController.protect , authController.updatePassword)

// -------- Lec_1 -------

// So, we are gonna upload single photo i.e. 
// .single() and in that single we will specify the name of the field that is going to hold the image to upload.

// router.route('/updateMe').patch(upload.single('photo') , authController.protect , userController.updateMe);

// now go to the userController.js and then updateMe handler

////////////////////////////////

// ----------- Lec_2 -------------

// router.route('/updateMe').patch(userController.uploadUserPhoto , authController.protect , userController.updateMe);


/////////////////////////////////

// ---------- Lec_4 -----------

router.route('/updateMe').patch(userController.uploadUserPhoto , userController.resizeUserPhoto , authController.protect , userController.updateMe);

// -----------------------------------

router.route('/deleteMe').delete(authController.protect , authController.deleteMe)

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;  
