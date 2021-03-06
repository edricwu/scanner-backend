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
            if (row[0]["level"] < 3){
                db.query("SELECT ??.*, users.name AS username FROM ?? INNER JOIN users WHERE user_id = users.id ORDER BY ??.date_added DESC", [req.params.type + "_info", req.params.type + "_info", req.params.type + "_info"], function(err, row) {
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
                            INSERT INTO bak_info (id, list_id, unit, user_id) VALUES (?, ?, ?, ?)", 
                            [row[0]["random_num"], "bak", row[0]["random_num"], req.body.list_id, req.body.unit, row0[0]["id"]], function(err, row1) {
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
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
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
                            INSERT INTO semaian_info (id, list_id, name, user_id, merek_seed, batch_no, jumlah_awal, masa_panen) VALUES (?, ?, ?, ?, ?, ?, ?, ?); \
                            UPDATE semaian_form SET latest_batch = latest_batch + 1 WHERE id = ?;", 
                            [row[0]["random_num"], "semaian", row[0]["random_num"], req.body.list_id, req.body.name, row0[0]["id"], req.body.merek_seed, req.body.batch_no, req.body.jumlah_awal, req.body.masa_panen, req.body.list_id], function(err, row1) {
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
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] < 3){
                db.query("DELETE FROM ?? WHERE id = ?; DELETE FROM unique_ids WHERE id = ?", 
                [req.body.type + "_info", req.body.id, req.body.id], function (err, row) {
                    if (err == null) {
                        res.send("Deleted");
                    }
                    else if (err['errno'] == 1451) {
                        res.status(409);
                        res.send("Unable to delete, id is already tied to log (foreign key)");
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

router.post("/modify_semaian", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] < 3){
                db.query("UPDATE semaian_info SET masa_panen = ? WHERE id = ?", 
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

router.post("/panen", function(req, res, next) {
    var str = req.get('Authorization');
    try {
        var jwt_info =jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function(err, row0) {
            if (row0[0]["level"] <= 3){
                var date = moment(req.body.date, "DD-MM-YYYY").format("YYYY-MM-DD");
                
                    
                db.query(" \
                    set @row_number := 0; \
                    set @semaian_id := 0; \
                    SELECT semaian_info.name, semaian_info.batch_no, \
                        DATE_FORMAT(semaian_info.date_added, '%d/%c/%Y') as 'tanggal_semai', \
                        DATE_FORMAT(t1.date_added, '%d/%c/%Y') as 'pindah_tanam' \
                    FROM( \
                    SELECT \
                        @row_number:= IF(@semaian_id = semaian_id, @row_number + 1, 1) \
                        AS rn, \
                        @semaian_id:=semaian_id semaian_id, \
                        date_added \
                    FROM semaian_log ORDER BY date_added DESC) t1 \
                    INNER JOIN semaian_info ON t1.semaian_id = semaian_info.id \
                    WHERE rn = 1 \
                        AND DATE_ADD(DATE(t1.date_added), INTERVAL semaian_info.masa_panen DAY) \
                        = ?;", [date], function(err, row){
                            console.log(err);
                            if (err == null) {
                                res.send(row[2]);
                            }
                        })
                
                // var date = moment(req.body.date, "DD-MM-YYYY");
                // var day = date.day();
                // if (day == 0 || day == 2 || day == 4) {
                //     res.send([]);
                // }
                // else {
                //     var date1;
                //     if (day == 6) {
                //         date1 = date; 
                //     }
                //     else {
                //         date1 = moment(req.body.date, "DD-MM-YYYY").subtract(1, "day");
                //     }   
                //     var date2 = date;
                //     date1 = date1.format("YYYY-MM-DD");
                //     date2 = date2.format("YYYY-MM-DD");
                //     console.log(date1);
                //     console.log(date2);
                //     db.query(" \
                //         set @row_number := 0; \
                //         set @semaian_id := 0; \
                //         SELECT semaian_info.name, semaian_info.batch_no, \
                //             DATE_FORMAT(t1.date_added, '%d/%c/%Y') as 'pindah_tanam' \
                //         FROM( \
                //         SELECT \
                //             @row_number:= IF(@semaian_id = semaian_id, @row_number + 1, 1) \
                //             AS rn, \
                //             @semaian_id:=semaian_id semaian_id, \
                //             date_added \
                //         FROM semaian_log ORDER BY date_added DESC) t1 \
                //         INNER JOIN semaian_info ON t1.semaian_id = semaian_info.id \
                //         WHERE rn = 1 \
                //             AND DATE_ADD(DATE(t1.date_added), INTERVAL semaian_info.masa_panen DAY) \
                //             BETWEEN ? AND ?;", [date1, date2], function(err, row){
                //                 console.log(err);
                //                 if (err == null) {
                //                     res.send(row[2]);
                //                 }
                //             })
                // }                
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