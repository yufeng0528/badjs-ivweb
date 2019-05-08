const log4js = require('log4js');
const logger = log4js.getLogger();
const path = require('path');
const { mkdirs } = require('../utils/mkdir');

module.exports = function () {
    setTimeout(function () {
        // 2019-1-18日注释 => 使用 Linux 中的 crontab 做为数据导入定时器，之前用setTimeout定时器问题太多。
        // 统计 mongodb 中的数据存储在 mysql 中
        // const Service = require("../service/StatisticsService");
        // logger.info('start Statistics  ...');
        // new Service().startMonitor();

        const LogService = require("../service/LogService");
        const logService = new LogService();
        const pushProject = function () {
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
        mkdirs(path.join(__dirname, '../static/img/tmp'), (str) => {
            console.log(str || 'mkdir success');
        });
        mkdirs(path.join(__dirname, '../static/scoreimg'), (str) => {
            console.log(str || 'mkdir success');
        });

        // 邮件报表
        // 2019-1-18日注释 => 使用 Linux 中的 crontab 做为数据导入定时器，之前用setTimeout定时器问题太多。
        // var EmailService = require("../service/EmailService");
        // logger.info('start email report ...');
        // new EmailService().start();
    }, 3000);
};
