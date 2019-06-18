const request = require('request');
const mail = require('../utils/ivwebMail_for_single.js');

let INTERVAL = 2;
let mailed = false;

module.exports = function () {
    const LogService = require('../service/LogService');
    const UserService = require('../service/UserService');
    const logService = new LogService();
    const userService = new UserService();

    const { wechat_ping, ping } = global.pjconfig;
    const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wechat_ping}`;

    const job = function () {
        ping.forEach((id) => {
            const endDate = +new Date() - INTERVAL * 60 * 1000;
            const startDate = endDate - INTERVAL * 60 * 1000;

            logService.query({ id, startDate, endDate, 'level[]': 2, _t: +new Date() }, function (err, items) {
                console.log(`ping 检测, id: ${id}, 检测插入数据${items.length}条`);
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
    };
    // ping 逻辑
    let TIMER = setInterval(job, INTERVAL * 60 * 1000);
    // 限制邮件频率为10分钟一次
    // 晚上低峰期流量会比平时少
    setInterval(() => {
        const hour = new Date().getHours();
        if (hour > 1 && hour < 9) {
            if (INTERVAL !== 10) {
                INTERVAL = 10;
                clearInterval(TIMER);
                TIMER = setInterval(job, INTERVAL * 60 * 1000);
            }
        } else {
            if (INTERVAL !== 2) {
                INTERVAL = 2;
                clearInterval(TIMER);
                TIMER = setInterval(job, INTERVAL * 60 * 1000);
            }
        }
        mailed = false;
    }, 10 * 60 * 1000);

};

