const   mysql   = require('mysql'),
		cred    = require('../../config/mysql').cred,
		pool  = mysql.createPool({
			connectionLimit		: 10,
			host				: cred.host,
			user				: cred.user,
			password			: cred.password,
			database			: cred.database,
            insecureAuth		: false,
			supportBigNumbers	: cred.supportBigNumbers,
			bigNumberStrings	: cred.bigNumberStrings
		  }),
		  poolMonitoring = false;

if(poolMonitoring) {
	pool.on('acquire', function (connection) {
		console.log('MySQL Connection %d acquired', connection.threadId);
	});

	pool.on('connection', function (connection) {
		console.log(connection.state);
		console.log(connection.threadId);
	});

	pool.on('enqueue', function () {
		console.log('Waiting for available connection slot');
	});

	pool.on('release', function (connection) {
		console.log('Connection %d released', connection.threadId);
	});
}

exports.connection = pool;