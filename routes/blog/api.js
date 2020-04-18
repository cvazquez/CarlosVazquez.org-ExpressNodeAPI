var express = require('express'),
    router  = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  async function asyncCall() {
    const rows = await req.app.get('blogModel').getCategories();

    res.json({"categories": rows});
  }

  asyncCall()

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
