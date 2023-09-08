const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require('crypto'); // used for hashing or encrypting the token
const {promisify} = require('util');

const User = require(path.join(__dirname, "/../models/userModel"));
const AppError = require(path.join(__dirname, "./../utils/appError"));
const Email = require(path.join(__dirname , './../utils/email'));

const catchAsync = require('./../utils/catchAsync');

const signToken = (id) => {

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

};


const createSendToken = (user, statusCode, res) => {

  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Creating a new User
exports.signUp = catchAsync(async (req, res, next) => {

    const newUser = await User.create({

      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      photo: req.body.photo
      
    });

    // ---------- Lec_9 ------------
    // So, we want to point on the userAccount so, that user can upload it photo.
    // const url = 'http://127.0.0.1:3000/me';

    // Works in both production and Development
    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email (newUser , url).sendWelcome();

    ///////////////////////

    createSendToken(newUser, 201, res);
    
  });


exports.login = catchAsync (async (req, res, next) => {

    // Using ES6 destructuring
    const { email, password } = req.body;

    // 1️⃣ Check if email and password exists
    if (!email || !password) {
      return next(new AppError("Please provide email and password! 💥", 400));
    }

  
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      
      return next(new AppError("Incorrect Email or Password", 401));

    }

    // 3) If everything ok, send token to client
  createSendToken(user, 200, res);

  }); 



exports.logout = (req , res) => {
   
   res.cookie('jwt' , 'loggedout' , {
     
    // After 5s we will we log out.
     expires: new Date(Date.now() + 5 * 1000),
     httpOnly: true

   });

   res.status(200).json({status: 'success'});


}


exports.protect = catchAsync(async (req , res , next) => {

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

      token = req.headers.authorization.split(' ')[1];
     
    } else if (req.cookies.jwt) {
         
         token = req.cookies.jwt;
    }
    
    // their is no token
    if (!token) {

      return next(new AppError ('You are not loggen in! Please login to get access' , 401));
      
    }


    const decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET);

    const currentUser = await User.findById (decoded.id);

    if (!currentUser) {

      return next(new AppError ('The user belonging to this token does not longer exists.' , 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {

       return next (new AppError ('User recently changed password! Please log in again.' , 401));
    }

   
    req.user = currentUser;
    res.locals.user = currentUser; 
    next();
});

exports.isLoggedIn = async (req, res, next) => {


  if (req.cookies.jwt) {
    try {

      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );


      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {

        return next();

      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

    
      res.locals.user = currentUser;

      return next();
      
      
    } catch (err) {

      return next();

    }
  }

  next();
};


exports.restrictTo = (...roles) => {
    
    return (req , res , next) => {

        if (!roles.includes(req.user.role)) {

          return next (new AppError ('You donot have permission to perform this action' , 403));

        }

        next();
    }
}


exports.forgotPassword = async (req , res , next) => {
     
  try {

     // 1️⃣ ) Get user based on Posted email
     const user = await User.findOne({email: req.body.email});

     if (!user) {

         return next (new AppError ('There is no user with email address.' , 404));
     }

     // 2️⃣ ) Generate the random reset token

     // go to the userModel.js for step-2 implementation

     const resetToken = user.createPasswordResetToken ();
     
     await user.save({validateBeforeSave : false});
     
     try {

         // 3️⃣ ) Send it to user's email
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
     

        // --------- Lec_10 ----------
        await new Email (user , resetURL).sendPasswordReset();

        res.status(200).json({

           status: 'success',
           message: 'Token send to email'
        
        });
        
     } catch (err){

        User.createPasswordResetToken = undefined,

        user.passwordResetExpires = undefined;

        await user.save({validateBeforeSave : false});

        return next (new AppError ('There was an error sending the email. Try again later!') , 500);
     }


  } catch {

       res.status(404).json ({

          status: 'fail',
          message: 'Try again to reset the password !'
       })
  }
}


exports.resetPassword = async (req , res , next) => {

    try {

      // 1️⃣) Get user based on the token
    const hashedToken = crypto
    .createHash ('sha256')
    .update(req.params.token)
    .digest('hex');
    
    const user = await User.findOne({passwordResetToken : hashedToken , passwordResetExpires : {$gt: Date.now()}});

    // 2️⃣) If token has not expired, and there is user, set the new password

    // No user exists
    if (!user) {

      return next (new AppError ('Token is invalid or has expired') , 400);
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

  
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);

    } catch (err) {

        res.status(500).json ({

           status : 'fail',
           message : 'Try again to reset the password !'
        });
    }
}




exports.updatePassword = async (req , res , next) => {
    
   try {


    // 1️⃣) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password');

    // 2️⃣) Check if Posted current password is correct

    if (!(await user.correctPassword(req.body.passwordCurrent , user.password))) {

       return next (new AppError ('Your current password is wrong.' , 401));
    }
  
  
    // 3️⃣) If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    
    await user.save();

  
    // 4️⃣) Log the user in , send JWT
    createSendToken(user, 200, res);
    
   } catch (err) {

    res.status(500).json ({

       status : 'fail',
       message : 'Try again to reset the password !'
    })
       
   }
}



exports.deleteMe = async (req , res , next) => {
   
   try {

    // And setting active as false.
    await User.findByIdAndUpdate(req.user.id , {active: false});

    res.status(204).json ({

      status: 'success',
      data: null

    });


   } catch (err) {

      res.status(400).json ({

          status : 'fail',
          message : err
      })
   }
}


