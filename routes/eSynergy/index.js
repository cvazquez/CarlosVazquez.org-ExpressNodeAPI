const	express	= require('express'),
		router  = express.Router(),
		http	= require("http");

let eSynergy	= [];

async function apiRequest(method, queryString) {
    return new Promise((resolve, reject) => {
        const	 options	= {
                    host	: eSynergy.host,
                    port	: eSynergy.port,
                    path	: eSynergy.path + method + (queryString && queryString.trim().length ? "?" + queryString : "")
                };

        console.log(options.host + ":" + options.port + options.path);

        http.get(options,
                res => {
                    var body = '';

                    res.on('data', chunk => body += chunk);

                    res.on("end", () => {
                        try {
                            let jsonResponse = JSON.parse(body)[0];

                            if(jsonResponse.requestStatus && jsonResponse.requestStatus === "APPROVED") {
                                process.stdout.write(`\n\n********* Success *********`);

                                resolve(jsonResponse);
                            } else {
                                process.stdout.write(`\n\n********* jsonResponse.error *********`);

                                reject(jsonResponse)
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
	eSynergy	= req.app.get('eSynergy');
	next();
});


// http://api.carlosvazquez.org/eSynergy/ProcessingRequestsInsecure
router.get('/ProcessingRequestsInsecure', async (req, res) => {
	const getResult = await apiRequest("ProcessingRequestsInsecure");

	res.json(getResult);
});

module.exports = router;