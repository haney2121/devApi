//function in a function
const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //copy request query
  const reqQuery = { ...req.query };
  //fields to exclude
  const removeFields = ['select', 'sort', 'limit', 'page'];
  // loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);
  // gt > Greate Then | gte >= Greater Then Equal | lt > Lesser Then | lte <= Lesser Then Equal | in [] Array List
  //create operators ($gt, $gte, etc) for mongoose
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => {
    return `$${match}`;
  });
  //finding resources
  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  //skip
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  if (populate) {
    query = query.populate(populate);
  }

  //Executing the query
  const results = await query;
  res.advancedResults = {
    succes: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
