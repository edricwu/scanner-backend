var express = require('express');
var router = express.Router();

var dotenv = require('dotenv');
dotenv.config();

var jwt = require('jsonwebtoken');
var db = require('../config/mysql');

router.get("/bak/all_months", function(req, res, next) {
    var str = req.get('Authorization');
    console.log(req);
    try {
        // var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query('SELECT DISTINCT MONTHNAME(date_added) AS Month, YEAR(date_added) AS Year FROM bak_log ORDER BY date_added DESC;', function(err, result) {
            console.log(result);
            res.send(result);
        })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.get("/semaian/all_months", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query('SELECT DISTINCT MONTHNAME(date_added) AS Month, YEAR(date_added) AS Year FROM semaian_log ORDER BY date_added DESC;', function(err, result) {
            console.log(result);
            res.send(result);
        })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.get("/bak/dates/:month/:year", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        // var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query('SELECT DISTINCT DATE_FORMAT(date_added, "%d/%m/%Y") AS Date FROM bak_log WHERE \
            (MONTHNAME(date_added), YEAR(date_added)) = (?, ?) ORDER BY date_added DESC;', [req.params.month, req.params.year], function(err, result) {
            res.send(result);
        })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.get("/semaian/dates/:month/:year", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query('SELECT DISTINCT DATE_FORMAT(date_added, "%d/%m/%Y") AS Date FROM semaian_log WHERE \
            (MONTHNAME(date_added), YEAR(date_added)) = (?, ?) ORDER BY date_added DESC;', [req.params.month, req.params.year], function(err, result) {
                console.log(err);
            res.send(result);
        })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/bak/baks", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT DISTINCT unit FROM bak_log INNER JOIN bak_info ON bak_log.bak_id = bak_info.id WHERE \
            DATE(bak_log.date_added) = str_to_date(?, '%d/%m/%Y') ORDER BY unit;", 
            [req.body.date], function(err, result) {
                console.log(result)
                res.send(result);
            })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/semaian/semaians", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT DISTINCT CONCAT(name, ' - ', batch_no) AS unit FROM semaian_log INNER JOIN semaian_info ON semaian_log.semaian_id = semaian_info.id WHERE \
            DATE(semaian_log.date_added) = str_to_date(?, '%d/%m/%Y') ORDER BY unit;", 
            [req.body.date], function(err, result) {
                console.log(err)
                console.log(result)
                res.send(result);
            })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/bak/times", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT DISTINCT bak_log.id, TIME(bak_log.date_added) AS Time FROM bak_log \
            INNER JOIN bak_info ON bak_log.bak_id = bak_info.id WHERE \
            (DATE(bak_log.date_added), unit) = (str_to_date(?, '%d/%m/%Y'), ?) ORDER BY TIME(bak_log.date_added) DESC;", 
            [req.body.date, req.body.unit], function(err, result) {
                console.log(err)
                console.log(result)
                res.send(result);
            })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/semaian/times", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT DISTINCT semaian_log.id, TIME(semaian_log.date_added) AS Time FROM semaian_log \
            INNER JOIN semaian_info ON semaian_log.semaian_id = semaian_info.id WHERE \
            (DATE(semaian_log.date_added), CONCAT(name, ' - ', batch_no)) = (str_to_date(?, '%d/%m/%Y'), ?) ORDER BY TIME(semaian_log.date_added) DESC;", 
            [req.body.date, req.body.unit], function(err, result) {
                console.log(err)
                console.log(result)
                res.send(result);
            })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.get("/bak/bak_id/:id", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query('SELECT bak_log.*, users.name AS username, bak_info.unit \
            from bak_log INNER JOIN users ON bak_log.user_id = users.id \
            INNER JOIN bak_info ON bak_log.bak_id = bak_info.id WHERE bak_log.id = ?;',
            req.params.id, function(err, result) {
            console.log(result);
            res.send(result);
        })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.get("/semaian/semaian_id/:id", function(req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query('SELECT semaian_log.*, users.name AS username, semaian_info.name, semaian_info.date_added AS date_created, semaian_info.merek_seed, semaian_info.batch_no, semaian_info.jumlah_awal \
            from semaian_log INNER JOIN users ON semaian_log.user_id = users.id \
            INNER JOIN semaian_info ON semaian_log.semaian_id = semaian_info.id WHERE semaian_log.id = ?;',
            req.params.id, function(err, result) {
            console.log(result);
            res.send(result);
        })
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/update/bak", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] < 3){
                db.query("UPDATE bak_log SET pH = ?, ppm = ?, suhu_air = ?, suhu_ruangan = ?, \
                kadar_oksigen = ?, pemakaian_air_ke = ?, keterangan = ? WHERE id = ?",
                [req.body.pH, req.body.ppm, req.body.suhu_air, req.body.suhu_ruangan, 
                req.body.kadar_oksigen, req.body.pemakaian_air_ke, req.body.keterangan, req.body.id],
                function(err, row) {
                    res.send("Updated");
                })
            }
        })
    }
    catch {
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/update/semaian", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] < 3){
                db.query("UPDATE semaian_log SET pindah_tanam = ?, harvest_pokok = ?, \
                harvest_kg = ?, sampling_weight = ?, keterangan = ?, type = ? WHERE id = ?",
                [req.body.pindah_tanam, req.body.harvest_pokok, 
                req.body.harvest_kg, req.body.sampling_weight, req.body.keterangan, req.body.type, req.body.id],
                function(err, row) {
                    res.send("Updated");
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