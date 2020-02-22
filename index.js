require('dotenv').config({ path: './config/config.env' });
const path = require('path');
const express = require('express');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const morgan = require('morgan');
const connectDB = require('./config/db');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const expressLimit = require('express-rate-limit');
const hpp = require('hpp');

//Route files
const bootcamp = require('./routes/bootcamps');
const courses = require('./routes/courses');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');
const users = require('./routes/users');

//setup express
const app = express();

//Body Parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File UPload
app.use(fileupload());

// Sanitize Data
app.use(mongoSanitize());

// set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xssClean());

// Rate limiting
const limiter = expressLimit({
  windowMs: 10 * 60 * 1000, // 10mins
  max: 1
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Cors
app.use(cors());

//setStatic folder
app.use(express.static(path.join(__dirname, 'public')));

//mount routers
app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/courses', courses);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

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
