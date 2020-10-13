var express = require('express');
var router = express.Router();

var dotenv = require('dotenv');
dotenv.config();

var jwt = require('jsonwebtoken');
var db = require('../config/mysql');

router.get('/:type', function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT level FROM users WHERE id = ?", jwt_info["id"], function(err, row) {
            if (row[0]["level"] < 3){
                db.query("SELECT ??.*, users.name AS username FROM ?? INNER JOIN users WHERE user_id = users.id ORDER BY ??.date_added", [req.params.type + "_info", req.params.type + "_info", req.params.type + "_info"], function(err, row) {
                    res.send(row);
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

router.post("/create/bak", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] < 3){
                db.query(
                    "SELECT random_num \
                    FROM ( \
                        SELECT LPAD(FLOOR(RAND() * 999999.99), 6, '0') AS random_num \
                    ) AS random_lists \
                    WHERE random_num NOT IN (SELECT id FROM unique_ids WHERE id IS NOT NULL) \
                    LIMIT 1", function(err, row) {
                        db.query(
                            "INSERT INTO unique_ids (id, type) VALUES (?, ?); \
                            INSERT INTO bak_info (id, unit, user_id) VALUES (?, ?, ?)", 
                            [row[0]["random_num"], "bak", row[0]["random_num"], req.body.unit, row0[0]["id"]], function(err, row1) {
                                if (err == null) {
                                    res.send(row[0]["random_num"]);
                                }
                            })
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

router.post("/create/semaian", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] < 3){
                db.query(
                    "SELECT random_num \
                    FROM ( \
                        SELECT LPAD(FLOOR(RAND() * 999999.99), 6, '0') AS random_num \
                    ) AS random_lists \
                    WHERE random_num NOT IN (SELECT id FROM unique_ids WHERE id IS NOT NULL) \
                    LIMIT 1", function(err, row) {
                        db.query(
                            "INSERT INTO unique_ids (id, type) VALUES (?, ?); \
                            INSERT INTO semaian_info (id, name, user_id, merek_seed, batch_no, jumlah_awal) VALUES (?, ?, ?, ?, ?, ?)", 
                            [row[0]["random_num"], "semaian", row[0]["random_num"], req.body.name, row0[0]["id"], req.body.merek_seed, req.body.batch_no, req.body.jumlah_awal], function(err, row1) {
                                // console.log(row[0]["random_num"]);
                                if (err == null) {
                                    res.send(row[0]["random_num"]);
                                }
                            })
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

router.post("/delete", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] < 3){
                db.query("DELETE FROM ?? WHERE id = ?; DELETE FROM unique_ids WHERE id = ?", 
                [req.body.type + "_info", req.body.id, req.body.id], function (err, row) {
                    res.send("Deleted");
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