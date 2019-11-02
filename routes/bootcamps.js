const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');
const advancedResults = require('../middleware/advancedResults');

const db = require('../models/index');

//Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

//Re-route into other resource routers -- route hit redirects to the courses route
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
  .route('/')
  .get(advancedResults(db.BootCamp, 'course'), getBootcamps)
  .post(createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
