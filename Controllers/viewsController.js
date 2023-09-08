
const Tour = require('../models/tourModel');
const AppError = require ('./../utils/appError');
const User = require ('./../models/userModel');

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking')
      res.locals.alert =
        "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
    next();
  };

exports.getOverview = async (req , res , next) => {

    try {

        // 1) Get tour data from collection
    const tours = await Tour.find();

    // 3) Render that template using tour data from  1)

    // Passing tours data into the Overview template
    res.status(200).render('overview' , {

       title: 'All Tours',
       tours 
    });

    } catch {

        res.status(404).render('<h1>Page Not Found</h1>');
    }

}    


exports.getTour =  async (req , res , next) =>
 {

        // 1) Get the data, for the requested tour
        const tour = await Tour.findOne({slug : req.params.slug});

    
        if (!tour) {
            return next(new AppError('There is no tour with that name.', 404));
        }
      
        // Sending some data to the tour.pug
        res.status(200).render('tour', {

            // Placeholder
            title: `${tour.name} Tour`,
            tour
          });

}


exports.getLoginForm = (req , res) => {
    
    // Rendering the login.pug template
    res.status(200).render('login' , {

        title: 'Log into your account'
    });   
}

exports.getSignUpForm = (req , res) => {

    // Rendering the signup.pug template
    res.status(200).render('signup' , {

        title: 'Create your account'
    });  

}

exports.getAccount = (req , res) => {
    
    // Rendering the account.pug template
    res.status(200).render('account' , {

        title: 'Your account'
    });   
}

// --------------- Lec_17 --------------------

const Booking = require('../models/bookingModel');

const catchAsync = require('./../utils/catchAsync');

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings

    // Out of all the bookings get those bookings which the logged-in user has done.
    const bookings = await Booking.find({ user: req.user.id });
  
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);

    const tours = await Tour.find({ _id: { $in: tourIDs } });
     
    // Ordered Tours.
    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });

////////////////////////////////////////////


exports.updateUserData = async (req , res , next) => {
      

    try {

    const updatedUser = await User.findByIdAndUpdate(req.user.id , {

        name: req.body.name,
        email: req.body.email
    },
    {
        new: true, // We want updated data in the updatedUser
        runValidators: true
    });

    res.status(200).render('account' , {

        title: 'Your account',
        user: updatedUser
    });   

    } catch (err) {
        
        next(new AppError(err.message , 403));
    }

}
