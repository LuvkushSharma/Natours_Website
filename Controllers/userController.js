const path = require('path');
const User = require(path.join (__dirname , './../models/userModel'));
const AppError = require('../utils/appError');
const catchAsync = require(path.join(__dirname , './../utils/catchAsync'));
// --------- Lec_2 -----------

const multer = require('multer');

/*

const multerStorage = multer.diskStorage({

   destination: (req, file, callBack) => {

      callBack(null , 'public/img/users' , );
   },
   
   // Here , cb is callback function which is similar to the next in the middlewares.

   // See , the req.file and there you can see a key named as mimetype.
   filename: async (req, file, cb) => {
        
        const name = req.body.name;
        const user = await User.findOne({ name })
        
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${user._id}-${Date.now()}.${ext}`);
      }
});

*/

// ----------- Lec_4 (multerStorage configure) ------

// So, saving image as a buffer in the memory.
const multerStorage = multer.memoryStorage();

// ---------------------------------------

// If the uploaded document is an image then pass true else false.
const multerFilter = (req, file, cb) => {
  
  // If the uploaded file is image then return true.
  if (file.mimetype.startsWith('image')) {

    cb(null, true);

  } else {

    cb(new AppError('Not an image! Please upload only images.', 400), false);

  }

};

// Now , in the options object we had provided the storage and the fileFilter.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

// now go to the userRoutes.js and paste above middleware.

////////////////////////////////////

// ----------- Lec_4 ------------
// Resizing the photo

const sharp = require('sharp');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {

  // If their is no upload i.e. no file in request then go to the next middleware.
  if (!req.file) return next();

  const name = req.body.name;
  const user = await User.findOne({ name })

  req.file.filename = `user-${user._id}-${Date.now()}.jpeg`;
  
  // Since , we had saved the image in the buffer instead of storage.
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  
  // Calling next middlewares.
  next();
});

exports.getAllUsers = async (req, res) => {

    try {
        
      const users = await User.find();

      res.status(200).json ({

         status : 'success',
         results: users.length,
         data: {
          users
         }
      })

    } catch {

      res.status(404).json({
        status: 'fail',
        message: 'No user found !'
      });
    }

  };


const filterObj = (obj , ...allowedFields) => {

     const newObj = {};
    
    Object.keys(obj).forEach(el => {

       if (allowedFields.includes(el)) newObj[el] = obj[el];

    });

    return newObj;
}


// -------------- Lec_1 -------------------
/*

exports.updateMe = async (req , res, next) => {

    console.log(req.file);

    // Since , req.body donot contains photo field that is why we have to use the multer package.
    console.log(req.body);

    // 1️⃣) Create error if user POSTs password data as we had created a separate handler for that in the authController.js

    if (req.body.password || req.body.passwordConfirm) {

       return next (new AppError ('This route is not for password updates. Please use /updateMyPassword' , 400));

    }
    
    // 2️⃣) Filtered out unwanted field names that are not allowed to be updated.
    const filteredBody = filterObj(req.body , 'name' , 'email');


    // 3️⃣) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody , {
      
      new : true , 
      runValidators : true
      
    });


    res.status(200).json ({

       status : 'success',
       data : {

          user: updatedUser
       }

    });
}

*/

// ------------------ Lec_2 -----------------

exports.updateMe = async (req , res, next) => {


  // 1️⃣) Create error if user POSTs password data as we had created a separate handler for that in the authController.js

  if (req.body.password || req.body.passwordConfirm) {

     return next (new AppError ('This route is not for password updates. Please use /updateMyPassword' , 400));

  }
  
  // 2️⃣) Filtered out unwanted field names that are not allowed to be updated.
  const filteredBody = filterObj(req.body , 'name' , 'email');

  // ---------- Lec_2 --------

  // Adding photo property to the filteredBody object from req.filename

   if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  ///////////////////////////


  // 3️⃣) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody , {
    
    new : true , 
    runValidators : true
    
  });
  
  res.status(200).json ({

     status : 'success',
     data : {

        user: updatedUser
     }

  });
}

exports.getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

exports.updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

exports.deleteUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
};
  


