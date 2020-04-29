var express = require('express'),
    router  = express.Router();

// GET home page.
router.get('/', function(req, res, next) {

	// Run all queries at the same time through a promise
	(async (blogModel, res) => {
		const	latestPosts     = blogModel.getLatestPosts(10),
				latestComments  = blogModel.getLatestComments(5),
				topCategories   = blogModel.getTopCategories(5);

		res.json( {
					latestPosts		: await latestPosts,
					latestComments  : await latestComments,
					topCategories   : await topCategories
		});
	})(req.app.get('blogModel'), res);

});

// GET All Categories
router.get('/getCategoriesPage', function(req, res, next) {

	(async (blogModel, res) => {
		const	categories      = blogModel.getCategories(),
				latestPosts     = blogModel.getLatestPosts(5),
				latestComments  = blogModel.getLatestComments(5),
				topCategories   = blogModel.getTopCategories(5);

		res.json( {
					categories		: await categories,
					latestPosts		: await latestPosts,
					latestComments  : await latestComments,
					topCategories   : await topCategories
		});
	})(req.app.get('blogModel'), res);

});

// GET A Single Category
router.get('/getCategoryPageByName/:categoryName', function(req, res, next) {
	// /getCategoryPageByName/About-Me

	(async (blogModel, res, categoryName) => {
		const	category		= blogModel.getCategoryByName(categoryName),
				categoryPosts	= blogModel.getCategoryPosts(categoryName),
				latestPosts     = blogModel.getLatestPosts(5),
				latestComments  = blogModel.getLatestComments(5),
				topCategories   = blogModel.getTopCategories(5);

		res.json( {
					category		: await category,
					categoryPosts	: await categoryPosts,
					latestPosts		: await latestPosts,
					latestComments  : await latestComments,
					topCategories   : await topCategories
		});
	})(req.app.get('blogModel'), res, req.params.categoryName);

});

router.get('/getPostPageByTitleURL/:titleURL', function(req, res, next) {
	// /getPostPageByTitleURL/Brasil-Miami-air-flight-to-Sao-Paulo-Panama

	(async (blogModel, res, titleURL) => {
		const	blogPost		= blogModel.getPostByTitleURL(titleURL),
				seriesPosts		= blogModel.getSeriesPostsByTitleURL(titleURL),
				postComments	= blogModel.getPostCommentsByTitleURL(titleURL),
				flikrImages		= blogModel.getFlikrImagesByTitleURL(titleURL),
				topCategories	= blogModel.getTopCategories(5),
				latestPosts     = blogModel.getLatestPosts(5),
				latestComments  = blogModel.getLatestComments(5);

		res.json(	{
						blogPost		: await blogPost,
						seriesPosts		: await seriesPosts,
						postComments	: await postComments,
						flikrImages		: await flikrImages,
						topCategories	: await topCategories,
						latestPosts		: await latestPosts,
						latestComments	: await latestComments
					}
		);
	})(req.app.get('blogModel'), res, req.params.titleURL);
});

// Get all Posts
router.get('/getPostSlugs', function(req, res, next) {
	(async (blogModel, res) => {
		res.json(	{
						postSlugs	: await blogModel.getPostSlugs()
					}
		);
	})(req.app.get('blogModel'), res);
});

router.post('/postComment', (req, res) => {


	if(req.headers["content-type"] === "application/json") {
		(async () => {
			let saveResponse = {
				status	: await req.app.get('blogModel').createPostComment(req.body),
				reqBody	: req.body
			};

			res.json(saveResponse);
		})()

	} else {
		res.json({status	: 'Incorrent Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}

});

module.exports = router;