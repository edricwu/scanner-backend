var express = require('express');
var dotenv = require('dotenv');
dotenv.config();

var router = express.Router();

var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var db = require('../config/mysql');

var user_limit = {1: 3, 2: 10, 3: 20};

/* GET users listing. */
router.get('/', function (req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT level FROM users WHERE  id = ?", jwt_info["id"], function(err, row0) {
            var level = row0[0]["level"];
            var query;
            if (level > 1){
                query = "SELECT id, name, level FROM users WHERE (level > ? OR id = ?) AND deleted = false";
            }
            else{
                query = "SELECT id, name, level FROM users WHERE (level >= ? OR id = ?) AND deleted = false"
            }
            db.query(query, [level, jwt_info["id"]], function(err, row) {
                res.send(row);
            })
        })
    }
    catch {
        res.status(401);
        res.send("Bad Token");
    }
});

router.get('/:id', function (req, res, next) {
    db.query("select id, name, level from users where id = ?", req.params.id, function (err, result) {
        res.send(result);
    })
});

router.post('/login', function (req, res, next) {
    var password = crypto.createHash('sha256').update(req.body.password).digest('hex');
    db.query("SELECT * FROM users WHERE (name, password, deleted) = (?, ?, false)", [req.body.name, password], function (err, row) {
        if (row.length != 0) {
            var payload = {
                id: row[0]["id"],
            };
            var token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { algorithm: 'HS256', expiresIn: "15d" });
            // var test = jwt.verify(token, process.env.JWT_SECRET_KEY, {algorithm: 'HS256'});
            res.send(token);
        }
        else {
            res.status(401)
            res.send("Incorrect username or password");
        }
    })
});

router.post('/add_user', function (req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT level FROM users WHERE id = ?", jwt_info["id"], function (err, row) {
            if (row[0]["level"] < 3) {
                db.query("SELECT COUNT(*) AS num_user FROM users WHERE deleted = false AND level = ?;", req.body.level, 
                function(err, row) {
                    if (row[0]["num_user"] >= user_limit[req.body.level]) {
                        res.status(405);
                        res.send("User limit has been reached");
                    }
                    else {
                        db.query("SELECT * FROM users WHERE name = ? AND deleted = false", req.body.name, function (err, row) {
                            if (row.length != 0) {
                                console.log(`User with name ${req.body.name} already exists`);
                                res.status(409);
                                res.send("A user with that name already exists");
                            }
                            else {
                                var password = crypto.createHash('sha256').update(req.body.password).digest('hex');
                                db.query("INSERT INTO users (name, password, level) VALUES (?, ?, ?)",
                                    [req.body.name, password, req.body.level], function(err, row) {
                                        res.send("A new user has been created");
                                    }
                                );
                            }
                        })
                    }
                })
            }
            else {
                res.status(403);
                res.send("Insufficient access right");
            }
        })
    }
    catch {
        res.status(401);
        res.send("Bad Token");
    }
})

router.post('/manage_user', function (req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT level FROM users WHERE id = ?", jwt_info["id"], function (err, row0) {
            if (row0[0]["level"] < 3) {
                db.query("SELECT level FROM users WHERE id = ?", req.body.id, function (err, row1) {
                    if (row0[0]["level"] <= row1[0]["level"]) {
                        db.query("SELECT COUNT(*) AS num_user FROM users WHERE deleted = false AND level = ? AND id != ?;",
                            [req.body.level, req.body.id], function(err, row) {
                                if (row[0]["num_user"] >= user_limit[req.body.level]) {
                                    res.status(405);
                                    res.send("User limit has been reached");
                                }
                                else {
                                    db.query("SELECT * FROM users WHERE name = ? AND deleted = false AND id != ?", [req.body.name, req.body.id], function (err, row) {
                                        if (row.length != 0) {
                                            console.log(`User with name ${req.body.name} already exists`);
                                            res.status(409);
                                            res.send("A user with that name already exists");
                                        }
                                        else {
                                            if (req.body.password != "") {
                                                var password = crypto.createHash('sha256').update(req.body.password).digest('hex');
                                                db.query("UPDATE users SET name = ?, password = ?, level = ? WHERE id = ?",
                                                    [req.body.name, password, req.body.level, req.body.id], function (err, row) {
                                                        console.log(err);
                                                        res.send("User has been modified");
                                                    }
                                                )
                                            }
                                            else {
                                                db.query("UPDATE users SET name = ?, level = ? WHERE id = ?",
                                                    [req.body.name, req.body.level, req.body.id], function (err, row) {
                                                        console.log(err);
                                                        res.send("User has been modified");
                                                    }
                                                )
                                            }
                                        }
                                    })
                                }
                            })
                    }
                    else {
                        res.status(403);
                        res.send("Insufficient access right");
                    }
                })
            }
            else {
                res.status(403);
                res.send("Insufficient access right");
            }
        });
    }
    catch {
        res.status(401);
        res.send("Bad Token");
    }
})

router.post('/delete_user', function (req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT level FROM users WHERE id = ?", jwt_info["id"], function (err, row0) {
            if (row0[0]["level"] < 3) {
                db.query("SELECT level FROM users WHERE id = ?", req.body.id, function (err, row1) {
                    if (row0[0]["level"] <= row1[0]["level"]) {
                        db.query("UPDATE users SET deleted = true WHERE id = ?", req.body.id, function (err, row) {
                            res.send("User deleted");
                        })
                    }
                })
            }
        })
    }
    catch {
        res.status(401);
        res.send("Bad Token");
    }
})

module.exports = router;
