/**
 * Created by tickli on 2019/01/18.
 */

// 这个文件通过 linux 定时器执行，默认执行时间为每天凌晨 5 点

var StatisticsService = require('../service/StatisticsService');
var orm = require('orm');
var Apply = require('../model/Apply');

GLOBAL.pjconfig = require('../project.json');

var mysqlUrl = GLOBAL.pjconfig.mysql.url;

var mdb = orm.connect(mysqlUrl, function (err, db) {
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

    var aa = new StatisticsService();

    function fetch(id, startDate, isEnd) {
        aa.fetchAndSave(id, startDate, function (err) {
            if (isEnd) {
                mdb.close();
            }
        });
    }

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);

    global.models.applyDao.find({status: Apply.STATUS_PASS}, function (err, items) {
        if (!err && items.length) {
            items.forEach((t, index) => {
                setTimeout(function () {
                    fetch(t.id, startDate, index === items.length -1);
                }, index * 500);
            });
        }
    });
});



