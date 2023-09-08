const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
     
  // photo: String,
  photo : {
    type: String,
    default: 'default.jpg'
  
  },
  
  role: {
    
    type: String,
    enum: ['user' , 'guide' , 'lead-guide' , 'admin'],
    default: 'user'

  } ,

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false 
  },

  passwordConfirm: {
    type: String,
    validate : {
       
      // "this" works in case
      // User.create()
      // user.save()
       validator : function (pc) {
          return this.password === pc;
       },

       message : 'Password and ConfirmPassword are not the same'
    }

  },

  passwordChangedAt: Date,

  passwordResetToken: String,
  passwordResetExpires: Date,

  active : {
     
    type: Boolean,
    default: true,
    select: false
  }

});


userSchema.pre('save' , async function (next) {

    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password , 12);
  
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save' , function (next) {
   
  if (!this.isModified ('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;

  next();

})


userSchema.pre(/^find/ , function (next) {

   this.find({active: {$ne : false}});
   next();
});



userSchema.methods.correctPassword = async function (candidatePassword , userPassword) {

   return await bcrypt.compare(candidatePassword , userPassword);

}


// JWTTimestamp : when the token was issued

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {

  // If this property exists it means user has changed the password and if not then it means user not changed it's password.
  if (this.passwordChangedAt) {

    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // by default we return false means token is valid as user not changed it's password
  return false;
}


userSchema.methods.createPasswordResetToken = function () {

   // plain reset token string that we will pass to the user on it's email
   const resetToken = crypto.randomBytes (32).toString('hex');
   
   // hashed reset token that we will use for comparing the plain string with the hashed reset string.
   this.passwordResetToken = crypto.createHash ('sha256').update(resetToken).digest('hex');
   
   // Reset token expires in 10min
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   
   // used to send by the email
   return resetToken;
}


// creating model out of the schema
// Where 'User' is the collection name in the database.
const User = mongoose.model('User' , userSchema);

module.exports = User;