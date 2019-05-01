const mysql = require('mysql');
const StatisticsService = require('../service/StatisticsService');
const orm = require('orm');
const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

global.DEBUG = true;


orm.connect(mysqlUrl, function (err, db) {
    if (err) {
        throw err;
    }

    global.models = {
        userDao: require('../dao/UserDao')(db),
        applyDao: require('../dao/ApplyDao')(db),
        approveDao: require('../dao/ApproveDao')(db),
        statisticsDao: require('../dao/StatisticsDao')(db),
        db: db
    };

    const aa = new StatisticsService();


    const startDate = new Date('2014-12-09 00:00:00');
    const nowDate = new Date;

    console.log(new Date('2014-12-02 00:00:00'));

    aa.queryById({ projectId: "990", startDate: new Date('2014-12-02 00:00:00') }, function (err, items) {
        console.log(items);
    });

});





