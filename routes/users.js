const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');
//db
const db = require('../models/index');
//allows the use of other routes to merger with this route
const router = express.Router();
//middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

//shortcut to say all routes here will have this information
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(db.User), getUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
