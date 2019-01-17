var StatisticsService = require('../service/StatisticsService');
var orm = require('orm');
GLOBAL.pjconfig = require('../project.json');

var mysqlUrl = GLOBAL.pjconfig.mysql.url;

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

    var aa = new StatisticsService();

    function fetch(id, startDate) {
        aa.fetchAndSave(id, startDate, function (err) {
            console.log(err);
        });
    }

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);

    global.models.applyDao.find({
        status: 1
    }, function (err, items) {
        if (!err && items.length) {
            var count = 0;
            items.forEach(t => {
                setTimeout(function () {
                    fetch(t.id, startDate);
                }, count * 500);
                count++;
            });
        }
    });

    setTimeout(() => {
        process.exit();
    }, 1000 * 60 * 10);
});



