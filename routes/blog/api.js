var express = require('express'),
    router = express.Router();

console.log(router)

/* GET home page. */
router.get('/', function(req, res, next) {

  //controller

    req.app.get('blogDS').query(`
    SELECT c.name, cu.name AS nameURL, count(distinct(ec.entryId)) AS entryCount
    FROM categories c
    INNER JOIN categoryurls cu ON cu.categoryId = c.id
    INNER JOIN entrycategories ec ON ec.categoryId = c.id
    INNER JOIN entries e ON e.id = ec.entryId
    GROUP BY ec.categoryId
    ORDER BY c.name`,
      function (err, rows, fields) {
        if (err) throw err

        //console.log(rows);

        res.json({"categories": rows[0].name});
   })

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
