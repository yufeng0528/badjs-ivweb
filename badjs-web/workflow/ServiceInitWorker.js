const log4js = require('log4js');
const logger = log4js.getLogger();
const path = require('path');
const { mkdirs } = require('../utils/mkdir');

module.exports = function () {
    setTimeout(function () {
        const LogService = require('../service/LogService');
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

        require('../service/OfflineLogService')();
        require('../service/PingService')();
        mkdirs(path.join(__dirname, '../static/img/tmp'), (str) => {
            console.log(str || 'mkdir success');
        });
        mkdirs(path.join(__dirname, '../static/scoreimg'), (str) => {
            console.log(str || 'mkdir success');
        });
    }, 3000);
};
