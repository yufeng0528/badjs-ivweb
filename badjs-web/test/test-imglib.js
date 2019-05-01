const imgLib = require('../lib/getImg.js');
const pv = require('../service/handle_pv_2.js');
const orm = require('orm');
const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

orm.connect(mysqlUrl, function (err, db) {

    const Score = db.define('b_score', {
        id: Number,
        badjsid: Number,
        score: String,
        date: Number
    });
    pv.getImg(Score, db, () => {});
})


// imgLib(data, extParam);
