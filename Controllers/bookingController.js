const AppError = require ('./../utils/appError');

const catchAsync = require('./../utils/catchAsync');

const Tour = require('../models/tourModel');

const stripe = require('stripe')('sk_test_51NlwmdSJ0J4T5F4cOJg4Dktked5r39y6AYzg6upZvMvWYzScX5HeyGtIQL9CH4wwjr0dRKijO4oivhvmObXjH1Bd00P8JJznFm');


exports.getCheckoutSession = catchAsync(async (req , res , next) => {

     // 1) Get the currently booked tour
     const tour = await Tour.findById (req.params.tourId);

     // 2) Create checkout session
    //  Setting options
     const session = await stripe.checkout.sessions.create({

           payment_method_types: ['card'],

        //    URL that we got after successful payment we got the url and that will redirect us to the home page.
          //  success_url: `${req.protocol}://${req.get('host')}/`,

          // ---------- Lec_16 ------------

          success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,

          ////////////////////////////////
           
           // so, if cancel then go to the tours page
           cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,

           customer_email: req.user.email,

        //    To create a new booking for the tour
        client_reference_id: req.params.tourId,

        // Information aboutproduct
        line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${tour.name} Tour`,
                  images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                  description: tour.summary,
                },
                unit_amount: tour.price * 100,
              },
              quantity: 1,
            },
          ],

        mode: 'payment',

     });

     // 3) Create session as response.
     res.status(200).json({

         status: 'success',
         session
     })
});


// ----------------- Lec_16 ---------------

const Booking = require('./../models/bookingModel');

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  
  // Now we will redirect to the Home page not req.url (i.e. not safe url).
  res.redirect(req.originalUrl.split('?')[0]);
});






///////////////////////////////////////////