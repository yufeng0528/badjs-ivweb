const fs = require('fs');
const readline = require('readline');
const orm = require('orm');
console.log(process.argv);
const filePath = process.argv[2];
const date = process.argv[3];
const pv = {};
const pvlist = [];

const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

const rs = fs.createReadStream(filePath, 'utf8');

const rl = readline.createInterface({
    input: rs,
    output: null // process.stdout
});

let badjsid;

rl.on('line', (input) => {
    const r = /\/badjs\/(\d+)/g.exec(input);

    if (r) {
        badjsid = r[1];
        if (!pv[badjsid]) {
            pv[badjsid] = 1;
        } else {
            pv[badjsid] += 1;
        }
    }
});


rl.on('close', () => {
    console.log('文件读完了。');
    for (const i in pv) {
        pvlist.push({
            badjsid: i - 0,
            pv: pv[i],
            date: date - 0
        });
    }

    console.log(pvlist);

    const mdb = orm.connect(mysqlUrl, function (err, db) {

        const pvDao = db.define("b_pv", {
            id: Number,
            badjsid: Number,
            pv: Number,
            date: Number
        });

        for (let i = 0; i < pvlist.length; i++) {
            const pv = pvlist[i];
            setTimeout(() => {
                pvDao.one({ badjsid: pv.badjsid, date: pv.date }, function (err, pvLog) {
                    if (pvLog) {
                        console.log('update pv log' + badjsid);
                        pvLog.pv = parseInt(pvLog.pv) + parseInt(pv.pv);
                        pvLog.save(function (err) {
                            if (err) {
                                console.log(err);
                            }
                            if (i === pvlist.length - 1) {
                                mdb.close();
                            }
                        });
                    } else {
                        console.log('insert pv log' + badjsid);
                        pvDao.create(pv, function (err, items) {
                            if (err) {
                                console.log(err);
                            }
                            if (i === pvlist.length - 1) {
                                mdb.close();
                            }
                        });
                    }
                });
            }, i * 1000);
        }
    });
});


