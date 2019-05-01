const moment = require('moment');
const orm = require('orm');

const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

const getYesterday = function () {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getYesterdayForPv = function () {
    const y = getYesterday();
    return moment(y.getTime()).format('YYYYMMDD');
};


const mdb = orm.connect(mysqlUrl, function (err, db) {

    const pv = db.define("b_pv", {
        id: Number,
        badjsid: Number,
        pv: Number,
        date: Number
    });

    const param = {
        date: getYesterdayForPv()
    };

    pv.find(param, function (err, items) {
        if (!err) {
            console.log('ok');

            console.log(JSON.stringify(items));

            // 插入score
            createScore(db, items);
        } else {
            console.log(err);
        }
    });

});

// pvlist pv的元数据
function createScore (db, pvlist) {

    const Statistics = db.define('b_statistics', {
        id: Number,
        projectId: Number,
        startDate: Date,
        endDate: Date,
        content: String,
        total: Number
    });

    const param = {
        startDate: getYesterday()
    };

    console.log(param);

    Statistics.find(param, (err, data) => {

        const scoreList = [];

        if (err) {
            console.log('error');
            console.log(err);
        } else {
            data.forEach(item => {

                const proId = item.projectId;
                const badjsTotal = item.total;

                let pv = 0;
                let score = 0;

                pvlist.forEach(item => {
                    if (item.badjsid == proId) {

                        pv = item.pv;
                    }
                });
                console.log(`badjsid: ${proId}, badjsTotal: ${badjsTotal}, pv: ${pv}, date: ${getYesterdayForPv()}`);

                if (pv > 0) {
                    score = ((badjsTotal / pv) * 100).toFixed(5);
                }

                scoreList.push({
                    badjsid: proId,
                    rate: score,
                    pv: pv,
                    badjscount: badjsTotal,
                    date: getYesterdayForPv()
                });
            });

            console.log(scoreList);

            const Quality = db.define('b_quality', {
                id: Number,
                badjsid: Number,
                rate: String,
                pv: Number,
                badjscount: Number,
                date: Number
            });

            Quality.create(scoreList, function (err, data) {
                mdb.close();
                if (!err) {
                    console.log('ok');
                } else {
                    console.log(err);
                }
            });
        }
    });
}



