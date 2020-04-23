var express = require('express'),
    router  = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  (async (blogModel, res) => {
    const	categories      = blogModel.getCategories(),
			latestPosts     = blogModel.getLatestPosts(10),
          	latestComments  = blogModel.getLatestComments(5),
          	topCategories   = blogModel.getTopCategories(5);

    res.json( {
                categories		: await categories,
                latestPosts		: await latestPosts,
                latestComments  : await latestComments,
                topCategories   : await topCategories
              }
    );
  })(req.app.get('blogModel'), res);

});

 router.get('/getAllBlogSlugs', function(req, res, next) {
	(async (blogModel, res) => {
		res.json(	{
						blogSlugs	: await blogModel.getAllBlogSlugs()
					}
		);
	})(req.app.get('blogModel'), res);
});

router.get('/getPostByTitle/:titleURL', function(req, res, next) {
	// /getPostByTitle/Brasil-Miami-air-flight-to-Sao-Paulo-Panama

	(async (blogModel, res, titleURL) => {
		console.log(titleURL);
		res.json(	{
						blogPost	: await blogModel.getPostByTitle(titleURL)
					}
		);
	})(req.app.get('blogModel'), res, req.params.titleURL);
});

module.exports = router;