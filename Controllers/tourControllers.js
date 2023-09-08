const Tour = require('../models/tourModel');

// ----------- Creating a new Tour ---------
exports.createTour = async (req, res) => {
    try {
    
      const newTour = await Tour.create(req.body); 
  
      // 201 is for data is created.
      res.status(201).json({
        status: 'sucess',
        data: {
          tour: newTour,
        },
      });
    } catch (err) {
      // Error can occur when we are creating a document without required fields.
  
      // 400 stands for bad request
      res.status(400).json({
        status: 'failed',
        message: err,
      });
    }
  };
  
  

  // --------- Reading All The Documents ----------
  
  exports.getAllTours = async (req, res) => {
    try {
  
      const tours = await Tour.find();
  
      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tours,
        },
      });
  
    } catch (err) {
  
      res.status(404).json({
        status: 'fail',
        message: err,
      });
  
    }
  };
  
  // ----------- Reading a Particular Tour ---------
  exports.getTour = async (req, res) => {
    try {
    
      const tour = await Tour.findById(req.params.id);
  
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
  
    } catch (err) {
  
      res.status(404).json({
        status: 'fail',
        message: err,
      });
  
    }
  };
  
  // ----------- Updating a Particular Tour ---------
  exports.updateTour = async (req, res) => {
    try {
  
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // return the modified document rather than the original.
        runValidators: true, 
      });
  
      res.status(200).json({
        status: 'success',
        data: {
          tour, // sending updated tour.
        },
      });
  
    } catch (err) {
  
      res.status(404).json({
        status: 'fail',
        message: err,
      });
  
    }
  };
  
  // ----------- Deleting a Particular Tour ---------
  exports.deleteTour = async (req, res) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);
  
      // 204 means no content. and don't send data back instead send null.
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  };
  
  