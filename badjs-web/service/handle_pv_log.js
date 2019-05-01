const fs = require('fs');
const readline = require('readline');
const orm = require('orm');
const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

const filePath = process.argv[2];
const date = process.argv[3];
const logdata = [];
let logpv = 0;

const rs = fs.createReadStream(filePath, 'utf8');

const rl = readline.createInterface({
    input: rs,
    output: null // process.stdout
});

rl.on('line', (input) => {
    logpv++;
});

rl.on('close', () => {
    logdata.push({
        logpv: logpv,
        date: date - 0
    });

    const mdb = orm.connect(mysqlUrl, function (err, db) {
        const pv = db.define("b_log_data", {
            id: Number,
            logpv: Number,
            date: Number
        });

        pv.create(logdata, function (err, items) {
            if (!err) {
                console.log('ok');

            } else {
                console.log(err);
            }
            mdb.close();
        });
    });
});


