var mysql = require('mysql');
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'mysql',
//     database: 'scanner_app',
//     timezone: '+01:00'
//   });

// const connection = mysql.createPool({
//     host: 'us-cdbr-east-02.cleardb.com',
//     user: 'b7412554ef8499',
//     password: '4a240af9',
//     database: 'heroku_d999f2664f85b0c',
//     timezone: '+01:00'
// });

// const connection = mysql.createPool({
//     host: 'us-cdbr-east-02.cleardb.com',
//     user: 'bf7f021fb15657',
//     password: '261c10fc',
//     database: 'heroku_c5ac1ba9fd3be0b',
//     timezone: 'UTC',
//     dateStrings: [
//         'DATE',
//         'DATETIME'
//     ],
//     multipleStatements: true
// });

const connection = mysql.createPool({
    host: '54.254.36.60',
    user: 'remote',
    password: 'remote123',
    // database: 'greenfeast',
    database: 'greenfeast_new',
    timezone: 'UTC',
    dateStrings: [
        'DATE',
        'DATETIME'
    ],
    multipleStatements: true
});

connection.on('connection', conn => {
    conn.query("SET time_zone='+07:00'; SET @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));", error => {
        if(error){
            throw error
        }
    })
})

// connection.connect(function (err) {
//     if (err) throw err;
// });

module.exports = connection;