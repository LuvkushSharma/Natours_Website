const express = require ("express");
const path = require ('path');
const tourController = require(path.join(__dirname , '/../Controllers/tourControllers'));
const authController = require(path.join(__dirname , './../Controllers/authController'));

const router = express.Router();

router
  .route('/')
  .get(authController.protect , tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect , 
    authController.restrictTo('admin' , 'lead-guide'),tourController.deleteTour);
  

module.exports = router;  


