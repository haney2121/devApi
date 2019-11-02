require('dotenv').config({ path: './config/config.env' });
const path = require('path');
const express = require('express');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const morgan = require('morgan');
const connectDB = require('./config/db');
const fileupload = require('express-fileupload');
//Middleware

//Route files
const bootcamp = require('./routes/bootcamps');
const courses = require('./routes/courses');

//setup express
const app = express();

//Body Parser
app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File UPload
app.use(fileupload());

//setStatic folder
app.use(express.static(path.join(__dirname, 'public')));

//mount routers
app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/courses', courses);

//error handler middleware comes after routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  connectDB();
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

//handles unhandle promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
