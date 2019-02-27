const fs = require('fs');
const readline = require('readline');
const orm = require('orm');

var filePath = process.argv[2];
var date = process.argv[3];
var logdata = [], logpv = 0;


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

    var mysqlUrl = 'mysql://root:root@localhost:3306/badjs';

    var mdb = orm.connect(mysqlUrl, function (err, db) {
        var pv = db.define("b_log_data", {
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


