const	express 		= require('express'),
		router  		= express.Router();

router.get('/getCategories', function(req, res) {

	(async (blogAdminModel, res) => {
		const categories		= blogAdminModel.getCategories();

		res.json( {categories : await categories});
	})(req.app.get('blogAdminModel'), res);

});

router.get('/getNewPost', (req, res) => {
	(async (blogAdminModel, res) => {
		const	categories	= blogAdminModel.getCategories(),
				series		= blogAdminModel.getSeries(),
				flickrSets	= blogAdminModel.getFlickrSets(true);

		res.json({
			categories	: await categories,
			series		: await series,
			flickrSets	: await flickrSets
		});

	})(req.app.get('blogAdminModel'), res);
})

// /getPost/191
router.get('/getPost/:id', function(req, res) {

	(async (blogAdminModel, res, id) => {
		const	post			= blogAdminModel.getPostById(id),
				postCategories	= blogAdminModel.getPostCategories(id),
				categories		= blogAdminModel.getCategories(),
				series			= blogAdminModel.getSeries(),
				postSeries		= blogAdminModel.getPostSeriesById(id),
				flickrSets		= blogAdminModel.getFlickrSets();

		res.json( {
					post			: await post,
					postCategories	: await postCategories,
					categories		: await categories,
					series			: await series,
					postSeries		: await postSeries,
					flickrSets		: await flickrSets
		});
	})(req.app.get('blogAdminModel'), res, req.params.id);

});

// Get list of blogs
router.get('/getPosts', function(req, res) {
	(async (blogAdminModel, res) => {
		const	posts	= blogAdminModel.getPosts();

		res.json( {
					posts	: await posts
		});
	})(req.app.get('blogAdminModel'), res);

});

// Get list of series
router.get('/getSeries', function(req, res) {
	(async (blogAdminModel, res) => {
		res.json( {	series	: await blogAdminModel.getSeries() });
	})(req.app.get('blogAdminModel'), res);

});

router.get('/getSeriesPostsById/:id', function(req, res) {

	(async (blogAdminModel, res, id) => {
		res.json( { seriesPosts : await blogAdminModel.getSeriesPostsById(id) });
	})(req.app.get('blogAdminModel'), res, req.params.id);

});

router.post('/saveDraft', (req, res) => {

	if(req.is('json')) {
		(async body => {
			const saveResponse = {
				status	: await req.app.get('blogAdminModel').saveDraft(body),
				reqBody	: body
			};

			res.json(saveResponse);
		})(req.body)

	} else {
		res.json({status	: 'Incorrent Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/addCategory', (req, res) => {
	if(req.is('json')) {
		(async body => {
			const 	addedCategory = await req.app.get('blogAdminModel').addCategory(body.newCategory);

			res.json({addedCategory});
		})(req.body);
	}
})

router.post('/addPost', (req, res) => {
	if(req.is('json')) {
		(async body => {
			const 	savePost 			= await req.app.get('blogAdminModel').addPost(body),
					savePostCategories	= body.categoryNamesSelected.length ? req.app.get('blogAdminModel').savePostCategories(savePost.insertId, body.categoryNamesSelected) : null,
					savePostSeries		= body.seriesNameSelected.length ? req.app.get('blogAdminModel').savePostSeries(savePost.insertId, body.seriesNameSelected) : null,
					savePostFlickrSet	= body.flickrSetId.length ? req.app.get('blogAdminModel').savePostFlickrSet(savePost.insertId, body.flickrSetId) : null;

			res.json({
						savePost				: savePost,
						savePostCategories		: await savePostCategories,
						savePostSeries			: await savePostSeries,
						savePostFlickrSet		: await savePostFlickrSet
			});
		})(req.body);
	}
})

router.post('/addSeries', (req, res) => {
	if(req.is('json')) {
		(async body => {
			const 	addSeries = await req.app.get('blogAdminModel').addSeries(body.newSeries);

			res.json({addSeries});
		})(req.body);
	}
})

router.post('/updateCategory', (req, res) => {
	if(req.is('json')) {
		(async body => {
			// if body.name is empty but body.id exists, then deactivate the category
			const 	status = await req.app.get('blogAdminModel').updateCategory(body);

			res.json(status);
		})(req.body)

	} else {
		res.json({status	: 'Incorrent Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/updatePost', (req, res) => {

	if(req.is('json')) {
		(async body => {
			const 	savePost 				= req.app.get('blogAdminModel').updatePost(body),
					deletePostCategories	= req.app.get('blogAdminModel').deletePostCategories(body.entryId, body.categoryNamesSelected),
					savePostCategories		= req.app.get('blogAdminModel').savePostCategories(body.entryId, body.categoryNamesSelected),
					deletePostSeries		= req.app.get('blogAdminModel').deletePostSeries(body.entryId, body.seriesNameSelected),
					savePostSeries			= req.app.get('blogAdminModel').savePostSeries(body.entryId, body.seriesNameSelected),
					savePostFlickrSet		= req.app.get('blogAdminModel').savePostFlickrSet(body.entryId, body.flickrSetId);

			res.json({
						savePost				: await savePost,
						deletePostCategories	: await deletePostCategories,
						savePostCategories		: await savePostCategories,
						deletePostSeries		: await deletePostSeries,
						savePostSeries			: await savePostSeries,
						savePostFlickrSet		: await savePostFlickrSet
			});
		})(req.body)

	} else {
		res.json({status	: 'Incorrent Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/updatePostSeriesSequence', (req, res) => {
	if(req.is('json')) {
		(async body => {
			const saveSequence	= req.app.get('blogAdminModel').updatePostSeriesSequence(body.postId, body.seriesId, body.sequence);

			res.json({
				saveSequence	: await saveSequence
			});
		})(req.body);
	}
})

router.post('/updateSeries', (req, res) => {
	if(req.is('json')) {
		(async body => {
			// if body.name is empty but body.id exists, then deactivate the series
			const 	status = body.name.trim().length ? req.app.get('blogAdminModel').updateSeries(body) : req.app.get('blogAdminModel').deactivateSeries(body.id);

			res.json(await status);
		})(req.body)

	} else {
		res.json({status	: 'Incorrent Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})


module.exports = router;