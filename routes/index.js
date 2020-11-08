const e = require('express');
var express = require('express');
var router = express.Router();
var db = require('../config/mysql');

/* GET home page. */
router.get('/', function(req, res, next) {
    db.query("SELECT * FROM users WHERE level = -1", function(err, row) {
        if (err !== null) {
            res.send("Cannot connect to database");
            res.status(400);
        }
        else {
            res.render('index', { title: 'Successful' });
        }
    })
});

module.exports = router;
