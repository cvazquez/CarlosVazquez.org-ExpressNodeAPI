const	express 		= require('express'),
		router  		= express.Router();

let requestTracking	= {};

router.all('*', (req, res, next) => {
	// Save visitor information

	requestTracking	= {
		host		: req.headers.host,
		referer		: req.headers.referer,
		userAgent	: req.headers['user-agent'],
		ip			: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
		pathInfo	: req.url
	};

	next();
})

router.get('/tracking', (req, res, next) => {
	req.app.get('blogModel').createVisit(requestTracking, () =>{});

	res.json({});
})

// GET home page.
router.get('/', async (req, res) => {
	const	blogModel 			= req.app.get('blogModel'),
			// Run all queries at the same time through a promise
			latestPosts     	= blogModel.getLatestPosts(10),
			latestComments  	= blogModel.getLatestComments(5),
			topCategories   	= blogModel.getTopCategories(5),
			latestSeries		= blogModel.getLatestSeries(5),
			latestImagePosts	= blogModel.getImagePosts(5);

		res.json( {
					latestPosts			: await latestPosts,
					latestComments  	: await latestComments,
					topCategories   	: await topCategories,
					latestSeries		: await latestSeries,
					latestImagePosts	: await latestImagePosts
		});
});

// GET All Categories
router.get('/getCategoriesPage', async (req, res) => {
	const	blogModel 			= req.app.get('blogModel'),
			categories      	= blogModel.getCategories(),
			latestPosts     	= blogModel.getLatestPosts(5),
			latestComments  	= blogModel.getLatestComments(5),
			topCategories   	= blogModel.getTopCategories(5),
			latestSeries		= blogModel.getLatestSeries(5),
			latestImagePosts	= blogModel.getImagePosts(5);

			res.json( {
						categories			: await categories,
						latestPosts			: await latestPosts,
						latestComments  	: await latestComments,
						topCategories   	: await topCategories,
						latestSeries		: await latestSeries,
						latestImagePosts	: await latestImagePosts
			});
});

// GET A Single Category (ie. /getCategoryPageByName/About-Me )
router.get('/getCategoryPageByName/:categoryName', async (req, res) => {
	const	blogModel 			= req.app.get('blogModel'),
			categoryName		= req.params.categoryName,
			category			= blogModel.getCategoryByName(categoryName),
			categoryPosts		= blogModel.getCategoryPosts(categoryName),
			latestPosts     	= blogModel.getLatestPosts(5),
			latestComments  	= blogModel.getLatestComments(5),
			topCategories   	= blogModel.getTopCategories(5),
			latestSeries		= blogModel.getLatestSeries(5),
			latestImagePosts	= blogModel.getImagePosts(5);

		res.json( {
					category			: await category,
					categoryPosts		: await categoryPosts,
					latestPosts			: await latestPosts,
					latestComments  	: await latestComments,
					topCategories   	: await topCategories,
					latestSeries		: await latestSeries,
					latestImagePosts	: await latestImagePosts
		});
});

router.get('/getImagePosts', (req, res) => {
	(async function(blogModel, res) {
		const	imagePosts			= blogModel.getImagePosts(),
				latestPosts     	= blogModel.getLatestPosts(5),
				latestComments  	= blogModel.getLatestComments(5),
				topCategories   	= blogModel.getTopCategories(5),
				latestSeries		= blogModel.getLatestSeries(5),
				latestImagePosts	= blogModel.getImagePosts(5);

		res.json({
					imagePosts			: await imagePosts,
					latestPosts			: await latestPosts,
					latestComments  	: await latestComments,
					topCategories   	: await topCategories,
					latestSeries		: await latestSeries,
					latestImagePosts	: await latestImagePosts
		})
	})(req.app.get('blogModel'), res);
})

router.get('/getPostPageByTitleURL/:titleURL', (req, res, next) => {
	// /getPostPageByTitleURL/Brasil-Miami-air-flight-to-Sao-Paulo-Panama

	(async (blogModel, res, titleURL) => {
		const	blogPost			= blogModel.getPostByTitleURL(titleURL),
				seriesPosts			= blogModel.getSeriesPostsByTitleURL(titleURL),
				postComments		= blogModel.getPostCommentsByTitleURL(titleURL),
				flikrImages			= blogModel.getFlikrImagesByTitleURL(titleURL),
				topCategories		= blogModel.getTopCategories(5),
				latestPosts     	= blogModel.getLatestPosts(5),
				latestComments  	= blogModel.getLatestComments(5),
				latestSeries		= blogModel.getLatestSeries(5),
				latestImagePosts	= blogModel.getImagePosts(5);

		res.json(	{
						blogPost			: await blogPost,
						seriesPosts			: await seriesPosts,
						postComments		: await postComments,
						flikrImages			: await flikrImages,
						topCategories		: await topCategories,
						latestPosts			: await latestPosts,
						latestComments		: await latestComments,
						latestSeries		: await latestSeries,
						latestImagePosts	: await latestImagePosts
					}
		);
	})(req.app.get('blogModel'), res, req.params.titleURL);
});

// Get all Posts
router.get('/getPostSlugs', (req, res, next) => {
	(async (blogModel, res) => {
		res.json(	{
						postSlugs	: await blogModel.getPostSlugs()
					}
		);
	})(req.app.get('blogModel'), res);
});

router.get('/getSearchResults/:terms', (req, res) => {
	// /getSearchResults/peru

	(async (blogModel, res, terms) => {
		res.json(	{
						results	: await blogModel.getSearchResults(terms)

		})
	})(req.app.get('blogModel'), res, req.params.terms);

})

router.get('/getSeriesPage/:seriesName', (req, res) => {
	(async (blogModel, res, seriesName) => {
		const	series				= blogModel.getSeries(seriesName),
				topCategories		= blogModel.getTopCategories(5),
				latestPosts     	= blogModel.getLatestPosts(5),
				latestComments  	= blogModel.getLatestComments(5),
				latestSeries		= blogModel.getLatestSeries(5),
				latestImagePosts	= blogModel.getImagePosts(5);

		res.json(	{
						series				: await series,
						topCategories		: await topCategories,
						latestPosts			: await latestPosts,
						latestComments		: await latestComments,
						latestSeries		: await latestSeries,
						latestImagePosts	: await latestImagePosts
					}
		);
	})(req.app.get('blogModel'), res, req.params.seriesName);
})

router.get('/getSeriesPages', (req, res) => {
	(async (blogModel, res, titleURL) => {
		const	series				= blogModel.getLatestSeries(),
				topCategories		= blogModel.getTopCategories(5),
				latestPosts     	= blogModel.getLatestPosts(5),
				latestComments  	= blogModel.getLatestComments(5),
				latestSeries		= blogModel.getLatestSeries(5),
				latestImagePosts	= blogModel.getImagePosts(5);

		res.json(	{
						series				: await series,
						topCategories		: await topCategories,
						latestPosts			: await latestPosts,
						latestComments		: await latestComments,
						latestSeries		: await latestSeries,
						latestImagePosts	: await latestImagePosts
					}
		);
	})(req.app.get('blogModel'), res, req.params.titleURL);
})

router.post('/postComment', (req, res) => {

	if(req.is('json')) {
		(async (body, requestTracking) => {
			const saveResponse = {
				status	: await req.app.get('blogModel').createPostComment(body, requestTracking),
				reqBody	: body
			};

			res.json(saveResponse);
		})(req.body, requestTracking)

	} else {
		res.json({status	: 'Incorrent Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}

});

module.exports = router;