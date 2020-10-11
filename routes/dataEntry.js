var express = require('express');
var router = express.Router();

var dotenv = require('dotenv');
dotenv.config();

var jwt = require('jsonwebtoken');
var db = require('../config/mysql');

router.get("/info/:id", function (req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("select type from unique_ids where id = ?", req.params.id, function (err, result) {
            if (result.length == 0) {
                res.status(404);
                res.send("Unable to find QR code info")
            }
            else {
                db.query("select * from ?? where id = ?", [result[0]['type'] + "_info", req.params.id], function (err, result1) {
                    // var date = result[0]["date_added"];
                    // console.log(date.toLocaleString('en-GB', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}))
                    respond = result1[0];
                    respond["type"] = result[0]["type"];
                    // db.query("select * from users where id = ?", jwt_info['id'], function(err, result2) {
                    //     respond["current_user_id"] = result2[0]['id'];
                    //     respond["name"] = result2[0]['name'];
                        
                    // })
                    console.log(respond)
                    res.send(respond);
                });
            }
        });
    }
    catch{
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/bak", function(req, res, next) {
    var str = req.get('Authorization');
    var data = JSON.parse(req.body.data);
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query(
            "insert into bak_log (bak_id, user_id, pH, ppm, suhu_air, suhu_ruangan, kadar_oksigen, pemakaian_air_ke, keterangan) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                data.bak_id, data.user_id, data.pH, data.ppm, data.suhu_air, 
                data.suhu_ruangan, data.kadar_oksigen, data.pemakaian_air_ke,
                data.keterangan
            ],
            function (err, result) {
                if (err) {
                    res.status(400);
                    res.send("Something is wrong");
                }
                else {
                    res.status(200);
                    res.send("Entry has been added");
                }
            }
        );
    }
    catch {
        res.status(401);
        res.send("Bad Token");
    }
})

router.post("/semaian", function(req, res, next) {
    var str = req.get('Authorization');
    var data = JSON.parse(req.body.data);
    // var data = req.body;
    // console.log(data);
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query(
            "insert into semaian_log (semaian_id, user_id, semai, sprout, pindah_tanam, harvest_pokok, \
                harvest_kg, sampling_weight, keterangan) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                data.semaian_id, data.user_id, data.semai, data.sprout, data.pindah_tanam, 
                data.harvest_pokok, data.harvest_kg, data.sampling_weight, data.keterangan
            ],
            function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.send("Something is wrong");
                }
                else {
                    res.status(200);
                    res.send("Entry has been added");
                }
            }
        );
    }
    catch {
        res.status(401);
        res.send("Bad Token");
    }
})

module.exports = router;