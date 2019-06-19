const log4js = require('log4js');
const logger = log4js.getLogger();
const path = require('path');
const { mkdirs } = require('../utils/mkdir');

module.exports = function () {
    setTimeout(function () {
        // 2019-1-18��ע�� => ʹ�� Linux �е� crontab ��Ϊ���ݵ��붨ʱ����֮ǰ��setTimeout��ʱ������̫�ࡣ
        // ͳ�� mongodb �е����ݴ洢�� mysql ��
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

        require('../service/OfflineLogService')();
        require('../service/PingService')();
        mkdirs(path.join(__dirname, '../static/img/tmp'), (str) => {
            console.log(str || 'mkdir success');
        });
        mkdirs(path.join(__dirname, '../static/scoreimg'), (str) => {
            console.log(str || 'mkdir success');
        });

        // �ʼ�����
        // 2019-1-18��ע�� => ʹ�� Linux �е� crontab ��Ϊ���ݵ��붨ʱ����֮ǰ��setTimeout��ʱ������̫�ࡣ
        // var EmailService = require("../service/EmailService");
        // logger.info('start email report ...');
        // new EmailService().start();
    }, 3000);
};
