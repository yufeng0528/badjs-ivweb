var log4js = require('log4js');
var logger = log4js.getLogger();

module.exports = function () {
    setTimeout(function () {
        // 统计 mongodb 中的数据存储在 mysql 中
        var Service = require("../service/StatisticsService");
        logger.info('start Statistics  ...');
        new Service().startMonitor();


        var LogService = require("../service/LogService");
        var logService = new LogService();
        var pushProject = function () {
            logService.pushProject(function (err) {
                if (err) {
                    logger.warn('push project on system start and error ' + err);
                } else {
                    logger.info('push project on system start');
                }

            });
        };

        pushProject();


        require("../service/OfflineLogService")();


        // 邮件报表
        var EmailService = require("../service/EmailService");
        logger.info('start email report ...');
        new EmailService().start();
    }, 3000);
}
