var imgLib = require('../lib/getImg.js');
var pv = require('../service/handle_pv_2.js');
const orm = require('orm');


var mysqlUrl = 'mysql://root:root@localhost:3306/badjs';

orm.connect(mysqlUrl, function (err, db) {

    var Score = db.define('b_score', {
        id: Number,
        badjsid: Number,
        score: String,
        date: Number
    });
    pv.getImg(Score, db, () => {});
})


// imgLib(data, extParam);
