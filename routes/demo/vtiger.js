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
					path	: "/modules/Rest/Api.php/V1/Vtiger/Default/" + method + (queryString.trim().length && "?" + queryString),
					headers	: {
						"Authorization"	: "Basic " + Buffer.from(userName + ":" + accessKey).toString("base64")
					}
				};

		https.get(options,
				res => {
					var body = '';

					res.on('data', function(chunk){
						body += chunk;
					});

					res.on("end", () => {
						try {
							let jsonResponse = JSON.parse(body);

							if(jsonResponse.success) {
								resolve(jsonResponse.result);
							} else if (jsonResponse.error) {
								reject(jsonResponse.error)
							}

						} catch(e) {

							process.stdout.write(`\n\nError parsing JSON`);
							reject(e);
						}
					});
				}).on('error', (e) => {
					console.log(e)
					process.stdout.write(`\nAPI response error\n`);
					reject(e);
					return false;
				});
	}).catch(err => {
		process.stdout.write(err);

		process.stdout.write(`\n\nPromise Error\n\n`);
		console.log("url2", options.path)
		return false;
	});
}

router.all('*', (req, res, next) => {

	// Set blogAdminModel for all requests
	vtiger	= req.app.get('vtiger');
	next();
})

// http://api.carlosvazquez.org/demo/vtiger/retrieve/19x1
router.get('/retrieve/:id', async (req, res) => {
	const getResult = await apiRequest("retrieve", req.params.id ? req.params.id : "id=19x1");

	res.json(getResult)
});

router.get('/listtypes/:id', async (req, res) => {
	const getResult = await apiRequest("retrieve", req.params.id ? req.params.id : "fieldTypeList=null");

	res.json(getResult)
});

module.exports = router;