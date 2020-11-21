var express = require('express');
var router = express.Router();

var dotenv = require('dotenv');
dotenv.config();

var jwt = require('jsonwebtoken');
var db = require('../config/mysql');
var xlsx = require('xlsx');
var moment = require('moment');

function fitToColumn(data) {
    const columnWidths = [];
    for (const property in data[0]) {
        columnWidths.push({
            wch: Math.max(
                property ? property.toString().length : 0,
                ...data.map(obj =>
                    obj[property] ? obj[property].toString().length + 5 : 0
                )
            )
        });
    }
    return columnWidths;
}

function getHeights(data) {
    var heights = []
    data.forEach(element => {
        heights.push({hpt: 16});
    });
    heights.push({hpt: 16});
    return heights;
}

router.get("/bak/:month/:year", function (req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function (err, row0) {
            if (row0[0]["level"] < 3) {
                var date = req.params.year + "-" + moment().month(req.params.month).format("M") + "-01";
                db.query(
                    "SELECT unit AS 'Unit', DATE_FORMAT(bak_log.date_added, '%d/%m/%y') AS Tanggal, \
                        TIME_FORMAT(bak_log.date_added, '%H:%i') AS Jam, pH, ppm, suhu_air AS 'Suhu Air', \
                        suhu_ruangan AS 'Suhu Ruangan', kadar_oksigen AS 'Kadar Oksigen', \
                        pemakaian_air_ke AS 'Pemakaian Air ke', keterangan AS 'Keterangan', users.name AS 'User' FROM bak_log \
                    INNER JOIN bak_info ON bak_id = bak_info.id \
                    INNER JOIN users ON bak_log.user_id = users.id \
                    WHERE bak_log.date_added BETWEEN ? AND LAST_DAY(?) \
                    ORDER BY unit, bak_log.date_added;",
                    [date, date],
                    function (err, row) {
                        var name = "bak_data_" + req.params.month + "_" + req.params.year;
                        var wb = xlsx.utils.book_new();
                        var ws = xlsx.utils.json_to_sheet(row);
                        ws['!cols'] = fitToColumn(row);
                        ws['!rows'] = getHeights(row);
                        xlsx.utils.book_append_sheet(wb, ws, name);

                        const wopts = { bookType: 'xlsx', bookSST: false, type: 'base64' };
                        const buffer = xlsx.write(wb, wopts);

                        res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
                        res.end(Buffer.from(buffer, 'base64'));
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
})

router.get("/semaian/:month/:year", function (req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function (err, row0) {
            if (row0[0]["level"] < 3) {
                var date = req.params.year + "-" + moment().month(req.params.month).format("M") + "-01";
                db.query(
                    "SELECT semaian_info.name AS 'Tanaman', semaian_info.merek_seed AS 'Merek Seed', \
                        semaian_info.batch_no AS 'Kode Batch', DATE_FORMAT(semaian_log.date_added, '%d/%m/%y') AS Tanggal, \
                        TIME_FORMAT(semaian_log.date_added, '%H:%i') AS Jam, \
                        semaian_log.pindah_tanam AS 'Pindah Tanam', \
                        semaian_log.harvest_pokok AS 'Harvest (POKOK)', semaian_log.harvest_kg AS 'Harvest (kg)', \
                        semaian_log.pindah_tanam + semaian_log.harvest_pokok AS 'Survival Rate (POKOK)', \
                        IFNULL(ROUND((semaian_log.pindah_tanam + semaian_log.harvest_pokok) * 100/ semaian_info.jumlah_awal, 1), 0) AS 'Survival Rate (%)', \
                        semaian_log.sampling_weight AS 'Sampling Weight', semaian_log.keterangan AS 'Keterangan', \
                        users.name AS 'User' \
                    FROM semaian_log \
                    INNER JOIN semaian_info ON semaian_id = semaian_info.id \
                    INNER JOIN users ON semaian_log.user_id = users.id \
                    WHERE semaian_log.date_added BETWEEN ? AND LAST_DAY (?) \
                    ORDER BY semaian_info.name, semaian_info.merek_seed, semaian_info.batch_no, semaian_log.date_added;", 
                    [date, date],
                    function (err, row) {
                        var name = "semaian_data_" + req.params.month + "_" + req.params.year;
                        var wb = xlsx.utils.book_new();
                        var ws = xlsx.utils.json_to_sheet(row);
                        ws['!cols'] = fitToColumn(row);
                        ws['!rows'] = getHeights(row);
                        xlsx.utils.book_append_sheet(wb, ws, name);

                        const wopts = { bookType: 'xlsx', bookSST: false, type: 'base64' };
                        const buffer = xlsx.write(wb, wopts);

                        res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
                        res.end(Buffer.from(buffer, 'base64'));
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
})

router.get("/panen/:month/:year", function (req, res, next) {
    var str = req.get('Authorization');
    // console.log(req);
    try {
        var jwt_info = jwt.verify(str, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' });
        db.query("SELECT id, level FROM users WHERE id = ?", jwt_info["id"], function (err, row0) {
            if (row0[0]["level"] < 3) {
                var date = req.params.year + "-" + moment().month(req.params.month).format("M") + "-01";
                db.query(
                    " \
                    set @row_number := 0; \
                    set @semaian_id := 0; \
                    SELECT semaian_info.name AS 'Tanaman', semaian_info.merek_seed AS 'Merek Seed', \
                        semaian_info.batch_no AS 'Kode Batch', \
                        DATE_FORMAT(t1.date_added, '%d/%c/%Y') AS 'Pindah Tanam' , \
                        DATE_FORMAT(DATE_ADD(t1.date_added, INTERVAL semaian_info.masa_panen DAY), '%d/%c/%Y') AS 'Panen' \
                    FROM( \
                        SELECT \
                            @row_number:= IF(@semaian_id = semaian_id, @row_number + 1, 1) \
                            AS rn, \
                            @semaian_id:=semaian_id semaian_id, \
                            date_added \
                        FROM semaian_log ORDER BY date_added DESC) t1 \
                    INNER JOIN semaian_info ON t1.semaian_id = semaian_info.id \
                    WHERE rn = 1 \
                        AND DATE_ADD(t1.date_added, INTERVAL semaian_info.masa_panen DAY) \
                        BETWEEN '2020-11-01' AND LAST_DAY('2020-11-01');", 
                    [date, date],
                    function (err, row) {
                        row = row[2];
                        var name = "panen_" + req.params.month + "_" + req.params.year;
                        var wb = xlsx.utils.book_new();
                        var ws = xlsx.utils.json_to_sheet(row);
                        ws['!cols'] = fitToColumn(row);
                        ws['!rows'] = getHeights(row);
                        xlsx.utils.book_append_sheet(wb, ws, name);

                        const wopts = { bookType: 'xlsx', bookSST: false, type: 'base64' };
                        const buffer = xlsx.write(wb, wopts);

                        res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
                        res.end(Buffer.from(buffer, 'base64'));
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
})

module.exports = router;