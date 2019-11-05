const express = require('express');

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');
const db = require('../models/index');
const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

//allows the use of other routes to merger with this route
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(db.Course, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getCourses
  )
  .post(protect, createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;
