const log4js = require('log4js');
const logger = log4js.getLogger();
const path = require('path');
const request = require('request');
const mail = require('../utils/ivwebMail_for_single.js');
const INTERVAL = 2;
let mailed = false;

const { mkdirs } = require('../utils/mkdir');

module.exports = function () {
    setTimeout(function () {
        const LogService = require("../service/LogService");
        const UserService = require('../service/UserService');
        const logService = new LogService();
        const userService = new UserService();
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

        const pings = global.pjconfig.ping;
        const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${global.pjConfig.wechat_ping}`;
        // ping 逻辑
        setInterval(() => {
            pings.forEach((id) => {
                const endDate = +new Date() - INTERVAL * 60 * 1000;
                const startDate = endDate - INTERVAL * 60 * 1000;

                logService.query({ id, startDate, endDate, 'level[]': 2, _t: +new Date() }, function (err, items) {
                    if (!items.length) {
                        userService.queryMailByApplyId(id, function (err, data) {
                            const email = data[0].email;
                            const loginName = data[0].loginName;
                            const msg = `Aegis数据上报异常 - 检测到 aegis id: ${id} owner: ${loginName} 最近${INTERVAL}分钟没有数据上报，服务或者项目可能存在异常，请及时检查`;
                            if (!mailed) {
                                mailed = true;
                                let { ownerMailTo } = global.pjconfig;
                                mail('', `${ownerMailTo},${email}`, '', 'Aegis数据上报异常', msg, '', true);
                            }
                            request({
                                url,
                                method: 'POST',
                                json: {
                                    'msgtype': 'text',
                                    'text': {
                                        content: msg,
                                        mentioned_list: [loginName]
                                    }
                                }
                            }, () => {});
                        });
                    }
                });
            });
        }, INTERVAL * 60 * 1000);
        // 限制邮件频率为10分钟一次
        setInterval(() => {
            mailed = false;
        }, 10 * 60 * 1000);

    }, 3000);
};
