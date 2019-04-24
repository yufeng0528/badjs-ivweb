/**
 * Created by tickli on 2019/01/18.
 */

// 这个文件通过 linux 定时器执行，默认执行时间为每天凌晨 5 点

var path = require('path');
var orm = require('orm');

global.pjconfig = require(path.join(__dirname, "..", 'project.json'));

var msqlUrl = global.pjconfig.mysql.url;

var EmailService = require("../service/EmailService.js");

orm.connect(msqlUrl, function (err, db) {

    var models = {};
    db.use(require("orm-transaction"));
    models.userDao = require('../dao/UserDao')(db);
    models.applyDao = require('../dao/ApplyDao')(db);
    models.approveDao = require('../dao/ApproveDao')(db);
    models.userApplyDao = require('../dao/UserApplyDao')(db);
    models.statisticsDao = require('../dao/StatisticsDao')(db);
    models.pvDao = require('../dao/PvDao')(db);
    models.db = db;

    global.models = models;
    console.log('start email report ...');
    new EmailService().startRightNow();
});

setTimeout(() => {
    process.exit();
}, 3 * 60 * 60 * 1000);

