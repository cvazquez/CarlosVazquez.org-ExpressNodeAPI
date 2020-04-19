var express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Adventures Of Carlos Blog' });
});

module.exports = router;
