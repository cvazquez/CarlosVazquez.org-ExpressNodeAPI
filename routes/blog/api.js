var express = require('express'),
    router  = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  (async function(blogModel, res) {
    const	categories      = await blogModel.getCategories(),
			latestBlogs     = await blogModel.getLatestBlogs(5),
          	latestComments  = await blogModel.getLatestComments(5),
          	topCategories   = await blogModel.getTopCategories(5);

    res.json( {
                categories		: categories,
                latestBlogs		: latestBlogs,
                latestComments  : latestComments,
                topCategories   : topCategories
              }
    );
  })(req.app.get('blogModel'), res);

});

router.get('/categories', function(req, res, next) {

  req.app.get('blogDS').query('\
    SELECT title\
    FROM entries\
    WHERE id = 1',
    function (err, rows, fields) {
  if (err) throw err

  res.json({"title": rows[0].title});
 })

});

module.exports = router;