const app = require('./app');
const mongoose = require('mongoose');

// Replacing the <PASSWORD> placeholder by DATABASE_PASSWORD in the connection string.
const DB = process.env.DATABASE.replace(
     '<PASSWORD>',
     process.env.DATABASE_PASSWORD
);

// ------------------ HOSTED DATABASE -----------------
// It returns a promise

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection successful');
  })
  
// For testing API's on POSTMAN
const port = process.env.PORT || 3000;

// Listening to the server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
