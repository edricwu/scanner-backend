var express = require('express');
var router = express.Router();

var dotenv = require('dotenv');
dotenv.config();

var jwt = require('jsonwebtoken');
var db = require('../config/mysql');
var moment = require('moment');

router.get('/:type', function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT level FROM users WHERE id = ?", jwt_info["id"], function(err, row) {
            if (row[0]["level"] <= 1){
                db.query("SELECT ??.*, users.name AS username FROM ?? INNER JOIN users WHERE ??.deleted = false AND user_id = users.id ORDER BY ??.date_added DESC", 
                    [req.params.type + "_form", req.params.type + "_form", req.params.type + "_form", req.params.type + "_form"], 
                    function(err, row) {
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
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] <= 1){
                db.query("INSERT INTO bak_form (unit, user_id) VALUES (?, ?)", 
                    [req.body.unit, row0[0]["id"]], function(err, row) {
                        if (err == null) {
                            res.send("List added");
                        }
                    }
                )
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
});

router.post("/create/semaian", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] <= 1){
                db.query("INSERT INTO semaian_form (name, user_id, merek_seed, masa_panen) VALUES (?, ?, ?, ?)", 
                    [req.body.name, row0[0]["id"], req.body.merek_seed, req.body.masa_panen], 
                    function(err, row) {
                        if (err == null) {
                            res.send("List added");
                        }
                    }
                )
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
});

router.post("/modify_semaian", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] <= 1){
                db.query("UPDATE semaian_form SET masa_panen = ? WHERE id = ?", 
                [req.body.masa_panen, req.body.id], function (err, row) {
                    if (err == null) {
                        res.send("Successful");
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

router.post("/delete", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] <= 1){
                db.query("UPDATE ?? SET deleted = true WHERE id = ?;", 
                [req.body.type + "_form", req.body.id], function (err, row) {
                    if (err == null) {
                        res.send("Deleted");
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

module.exports = router;