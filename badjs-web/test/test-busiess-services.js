var mysql = require('mysql'),
    BusinessService = require('../service/BusinessService'),
    orm = require('orm');

global.DEBUG = true;

const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

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
    }

    var bs = new BusinessService();

    bs.findBusinessByUser("chriscai", function (err, data) {
        console.log(data)
    })

});





