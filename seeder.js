require('dotenv').config({ path: './config/config.env' });
const fs = require('fs');
const colors = require('colors');
const connectDB = require('./config/db');

//load models
const db = require('./models');

//connect to db
connectDB();

//read json files

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

//import records to DB
const importData = async () => {
  try {
    await db.BootCamp.create(bootcamps);
    await db.Course.create(courses);
    await db.User.create(users);
    await db.Review.create(reviews);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//delete records from db

const deleteData = async () => {
  try {
    await db.BootCamp.deleteMany();
    await db.Course.deleteMany();
    await db.User.deleteMany();
    await db.Review.deleteMany();
    console.log('Data Deleted...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
