const   mysql   = require('mysql'),
        cred    = require('../../config/mysql').cred,
        connection = mysql.createConnection({
            host        : cred.host,
            user        : cred.user,
            password    : cred.password,
            database    : cred.database,
            insecureAuth : true
        });

connection.connect();
exports.connection = connection;