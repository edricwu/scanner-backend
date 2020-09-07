var mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b7412554ef8499',
    password: '4a240af9',
    database: 'heroku_d999f2664f85b0c',
    timezone: '+01:00'
  });

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;