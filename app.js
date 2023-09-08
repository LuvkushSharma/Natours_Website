// Importing 
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression')


const cookieParser = require('cookie-parser');
const cors = require('cors');


// Importing AppError class
const AppError = require (path.join(__dirname ,'/utils/appError.js'));
const globalErrorHandler = require(path.join(__dirname ,'/Controllers/errorController.js'))

const tourRouter = require(path.join(__dirname , '/Routes/tourRoutes'));
const userRouter = require(path.join(__dirname , '/Routes/userRoutes'));

const viewRouter = require(path.join(__dirname , '/routes/viewRoutes'));

const bookingRouter = require(path.join(__dirname , '/routes/bookingRoutes'));

const app = express();

app.set ('view engine' , 'pug');
app.set ('views' , path.join(__dirname , 'views'));


// ################ Middlewares ################

// -------- Global Middlewares --------

// Implement CORS
app.use(cors());
app.options('*', cors());

app.use(compression());

// Serving static files

app.use (express.static (path.join (__dirname , 'public')));


if (process.env.NODE_ENV === 'development') {

    app.use(morgan('dev'));
}


const limiter = rateLimit({

    max: 100,
    windowMs : 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour.'
});


app.use('/api' , limiter);

//  ------------- Body Parser ----------

app.use(express.json({ limit : '10kb'}));

app.use (express.urlencoded({ extended: true , limit: '10kb'}));

app.use(cookieParser());

// Against NOSql query injection
app.use(mongoSanitize());

// this will clean any user input from malicious HTML code
app.use(xss());

// ----> Preventing Parameter Pollution
// Allowing duplicates in query string
app.use(hpp( {

     whitelist: ['duration' , 'ratingsQuantity' , 'ratingsAverage' , 'maxGroupSize' , 'difficulty' , 'price']
}))


app.use('/' , viewRouter);
app.use('/api/v1/tours' , tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);

// All the URL that gonna not handled before , will be handled here.
app.all('*' , (req , res , next) => {
    
    next(new AppError (`Can't find ${req.originalUrl} on this server` , 404));
})


// ----> Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;

