var mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'scanner_app',
    timezone: '+01:00'
  });

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;