const	express	= require('express'),
		router  = express.Router(),
		https	= require("https");

let vtiger	= [];

async function apiRequest(method, queryString) {
	return new Promise((resolve, reject) => {
		const	userName = vtiger.userName,
				accessKey = vtiger.accessKey,
				options	= {
					host	: vtiger.host,
					port	: 443,
					path	: "/modules/Rest/Api.php/V1/Vtiger/Default/" + method + (queryString && queryString.trim().length ? "?" + queryString : ""),
					headers	: {
						"Authorization"	: "Basic " + Buffer.from(userName + ":" + accessKey).toString("base64")
					}
				};

		console.log(options.host + ":" + options.port + options.path);

		https.get(options,
				res => {
					var body = '';

					res.on('data', chunk => body += chunk);

					res.on("end", () => {
						try {
							let jsonResponse = JSON.parse(body);

							if(jsonResponse.success) {
								process.stdout.write(`\n\n********* Success *********`);

								resolve(jsonResponse.result);
							} else if (jsonResponse.error) {
								process.stdout.write(`\n\n********* jsonResponse.error *********`);

								reject(jsonResponse.error)
							}

						} catch(e) {

							process.stdout.write(`\n\n********* Error parsing JSON *********`);
							reject(e);
						}
					});
				}).on('error', (e) => {
					process.stdout.write(`\n********* API response error *********\n`);

					console.log(e)
					reject(e);
					return false;
				});
	}).catch(err => {
		process.stdout.write(`\n\n********* Promise Error *********\n\n`);

		console.log(err);

		return({
			error : "Promise Error"
		});
	});
}

router.all('*', (req, res, next) => {

	// Set blogAdminModel for all requests
	vtiger	= req.app.get('vtiger');
	next();
})

// http://api.carlosvazquez.org/demo/vtiger/me
router.get('/me', async (req, res) => {
	const getResult = await apiRequest("me");

	res.json(getResult)
});

// http://api.carlosvazquez.org/demo/vtiger/retrieve/id=19x1
router.get('/retrieve/:id', async (req, res) => {
	const getResult = await apiRequest("retrieve", req.params.id ? req.params.id : "id=19x1");

	res.json(getResult)
});

// http://api.carlosvazquez.org/demo/vtiger/listtypes/fieldTypeList=null
router.get('/listtypes/:id', async (req, res) => {
	const getResult = await apiRequest("listtypes", req.params.id ? req.params.id : "fieldTypeList=null");

	res.json(getResult)
});

module.exports = router;