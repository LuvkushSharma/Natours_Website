
// We actually want all of our AppError objects to inherit from the built-in error 

class AppError extends Error {
    
  // This will be called each time time create a new object out of this class.
  constructor (message , statusCode) {

       super(message); // passing Parent class constructor and it accepts message as a parameter.

       this.statusCode = statusCode;

       // if status is 400 then it is faild and if 500 then internal server error.
       this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

       // This class will only handles operational errors
       this.isOperational = true;

      //  We will also capture the stack trace.
      // So, it will take the current object and the Class i.e. AppError here
      Error.captureStackTrace(this , this.constructor);

  }
}

module.exports = AppError;