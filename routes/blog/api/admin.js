const	express 		= require('express'),
		router  		= express.Router();

// Get list of blogs
router.get('/getEditList', function(req, res) {
	(async (blogAdminModel, res) => {
		const	posts	= blogAdminModel.getPostsToEdit();

		res.json( {
					posts	: await posts
		});
	})(req.app.get('blogAdminModel'), res);

});

// /getPost/191
router.get('/getPost/:id', function(req, res) {

	(async (blogAdminModel, res, id) => {
		const	post		= blogAdminModel.getPostById(id),
				categories	= blogAdminModel.getCategories();

		res.json( {
					post		: await post,
					categories	: await categories
		});
	})(req.app.get('blogAdminModel'), res, req.params.id);

});

router.post('/saveDraft', (req, res) => {

	if(req.is('json')) {
		(async (body) => {
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

router.post('/updatePost', (req, res) => {

	if(req.is('json')) {
		(async (body) => {
			const saveResponse = {
				status	: await req.app.get('blogAdminModel').updatePost(body),
				reqBody	: body
			};

			res.json(saveResponse);
		})(req.body)

	} else {
		res.json({status	: 'Incorrent Content Type: ' + req.headers["content-type"] + '. Expected application/json.'});
	}
})


module.exports = router;