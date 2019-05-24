const score = require('./handleScore.js');
const orm = require('orm');

const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

const mdb = orm.connect(mysqlUrl, function (err, db) {

    const Score = db.define('b_score', {
        id: Number,
        badjsid: Number,
        score: String,
        date: Number
    });
    score.handleScoreMail(Score, db, function () {
        mdb.close();
    });
});


