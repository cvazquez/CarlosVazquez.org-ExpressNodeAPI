var express = require('express'),
    router  = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  (async function(blogModel, res) {
    const latestBlogs     = await blogModel.getLatestBlogs(10),
          latestComments  = await blogModel.getLatestComments(5);

    res.json( {
                latestBlogs     : latestBlogs,
                latestComments  : latestComments
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