require('dotenv').config({ path: './config/config.env' });
const express = require('express');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const morgan = require('morgan');
const connectDB = require('./config/db');
//Middleware

//Route files
const bootcamp = require('./routes/bootcamps');

//setup express
const app = express();

//Body Parser
app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//mount routers
app.use('/api/v1/bootcamps', bootcamp);

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
