const	express 		= require('express'),
		router  		= express.Router();

let blogAdminModel,
	isAdmin = false;

router.all('*', (req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	// Set blogAdminModel for all requests
	blogAdminModel	= req.app.get('blogAdminModel');
	isAdmin			= req.app.get('adminIPs').indexOf(ip) > -1 ? true: false;
	next();
})

router.get('/deactivatePostById/:id', async (req, res) => {

	if(isAdmin) {
		res.json({
			deactivated	: await blogAdminModel.deactivatePostById(req.params.id)
		})
	} else {
		// Demo mocking
		res.json(
			{"deactivated":
				{	"fieldCount"	: 0,
					"affectedRows"	: 1,
					"insertId"		: 0,
					"serverStatus"	: 2,
					"warningCount"	: 0,
					"message"		: '(Rows matched: 1  Changed: 1  Warnings: 0","protocol41":true,"changedRows":1)'
				},
				isAdmin
			}
		)
	}

});

router.get('/getCategories', async (req, res) => {
	const categories		= blogAdminModel.getCategories();
	res.json( {categories : await categories});
});

router.get('/getNewPost', async (req, res) => {
	const	categories	= blogAdminModel.getCategories(),
			series		= blogAdminModel.getSeries(),
			flickrSets	= blogAdminModel.getFlickrSets(true);

	res.json({
		categories	: await categories,
		series		: await series,
		flickrSets	: await flickrSets,
		isAdmin
	});
})

// /getPost/191
router.get('/getPost/:id', async (req, res) => {
	const	id				= req.params.id,
			post			= blogAdminModel.getPostById(id),
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
				flickrSets		: await flickrSets,
				isAdmin
	});
});

// Get list of blogs
router.get('/getPosts', async (req, res) => {
	const	posts	= blogAdminModel.getPosts();

	res.json( {
				posts	: await posts,
				isAdmin
	});
});

// Get list of series
router.get('/getSeries', async (req, res) => {
	res.json( {	series	: await blogAdminModel.getSeries(),
				isAdmin });
});

// /blog/api/admin/getSeriesPostsById/4
router.get('/getSeriesPostsById/:id', async (req, res) => {
	res.json( { seriesPosts : await blogAdminModel.getSeriesPostsById(req.params.id),
				isAdmin });
});

router.post('/saveDraft', async (req, res) => {

	if(req.is('json')) {
		if(isAdmin) {
			const	body			= req.body,
					saveResponse	= {
						status	: await req.app.get('blogAdminModel').saveDraft(body),
						reqBody	: body
			};

			res.json(saveResponse);
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/addCategory', async (req, res) => {
	if(req.is('json')) {
		if(isAdmin) {
			const 	addedCategory = await req.app.get('blogAdminModel').addCategory(req.body.newCategory);

			res.json({addedCategory});
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/addPost', async (req, res) => {
	if(req.is('json')) {
		if(isAdmin) {
			const 	body				= req.body,
					savePost 			= await req.app.get('blogAdminModel').addPost(body),
					savePostCategories	= body.categoryNamesSelected.length ? req.app.get('blogAdminModel').savePostCategories(savePost.insertId, body.categoryNamesSelected) : null,
					savePostSeries		= body.seriesNameSelected.length ? req.app.get('blogAdminModel').savePostSeries(savePost.insertId, body.seriesNameSelected) : null,
					savePostFlickrSet	= body.flickrSetId.length ? req.app.get('blogAdminModel').savePostFlickrSet(savePost.insertId, body.flickrSetId) : null;

			res.json({
						savePost				: savePost,
						savedPostCategories		: await savePostCategories,
						savedPostSeries			: await savePostSeries,
						savedPostFlickrSet		: await savePostFlickrSet
			});
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/addSeries', async (req, res) => {
	if(req.is('json')) {
		if(isAdmin) {
			const 	addSeries = await req.app.get('blogAdminModel').addSeries(req.body.newSeries);

			res.json({addSeries});
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/updateCategory', async (req, res) => {
	if(req.is('json')) {
		if(isAdmin) {
			// if body.name is empty but body.id exists, then deactivate the category
			const 	status = await req.app.get('blogAdminModel').updateCategory(req.body);

			res.json(status);
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/updatePost', async (req, res) => {

	if(req.is('json')) {
		if(isAdmin) {
			const 	body					= req.body,
					savePost 				= blogAdminModel.updatePost(body),
					deletePostCategories	= blogAdminModel.deletePostCategories(body.entryId, body.categoryNamesSelected),
					savePostCategories		= body.categoryNamesSelected.length && blogAdminModel.savePostCategories(body.entryId, body.categoryNamesSelected),
					deletePostSeries		= blogAdminModel.deletePostSeries(body.entryId, body.seriesNameSelected),
					savePostSeries			= body.seriesNameSelected.length && blogAdminModel.savePostSeries(body.entryId, body.seriesNameSelected),
					savePostFlickrSet		= body.flickrSetId.length && blogAdminModel.savePostFlickrSet(body.entryId, body.flickrSetId),
					deletePostFlickrSet		= blogAdminModel.deletePostFlickrSet(body.entryId, body.flickrSetId);

				res.json({
							savePost				: await savePost,
							deletedPostCategories	: await deletePostCategories,
							savedPostCategories		: await savePostCategories,
							deletedPostSeries		: await deletePostSeries,
							savedPostSeries			: await savePostSeries,
							savedPostFlickrSet		: await savePostFlickrSet,
							deletePostFlickrSet		: await deletePostFlickrSet
				});
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/updatePostSeriesSequence', async (req, res) => {
	if(req.is('json')) {
		if(isAdmin) {
			const	body			= req.body,
					saveSequence	= req.app.get('blogAdminModel').updatePostSeriesSequence(body.postId, body.seriesId, body.sequence);

			res.json({
				saveSequence	: await saveSequence
			});
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

router.post('/updateSeries', async (req, res) => {
	if(req.is('json')) {
		if(isAdmin) {
			// if body.name is empty but body.id exists, then deactivate the series
			const 	body  	= req.body,
					status	= body.name.trim().length ? req.app.get('blogAdminModel').updateSeries(body) : req.app.get('blogAdminModel').deactivateSeries(body.id);

			res.json(await status);
		} else {
			res.json({});
		}
	} else {
		res.json({status	: 'Incorrect Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})

module.exports = router;