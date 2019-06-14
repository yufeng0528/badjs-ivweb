const log4js = require('log4js');
const logger = log4js.getLogger();

const { quantityLimitNotify } = require('../service');

const QUANTITY_LIMIT = 200000;
let reportRecord = {};

const endDate = new Date();
// 当前下一个整点
endDate.setHours(endDate.getHours(), 60, 0, 0);

// 每隔1小时清理上报记录
const CLEAR_INTERVAL = 60 * 60 * 1000;
const runIntervalClear = function () {
    setInterval(function () {
        reportRecord = {};
    }, CLEAR_INTERVAL);
};

logger.info('after ' + (endDate - new Date()) + ' run limit monitor clear');
setTimeout(function () {
    runIntervalClear();
}, endDate - new Date());

/**
 * Created by chriscai, 为后面的服务减少压力
 * 限制进程每个小时最大上报 200000
 */
module.exports = function () {
    return {
        process: function (data) {
            const arr = data.data;
            const id = arr ? arr[0].id : null;
            if (!id) {
                return false;
            }

            let total = 0;
            if (!reportRecord[id]) {
                reportRecord[id] = {};
                total = reportRecord[id].count = arr.length;
            } else {
                reportRecord[id].count += arr.length;
                total = reportRecord[id].count;
            }

            // 超过一半阈值后，提示一次异常
            if (total >= QUANTITY_LIMIT / 2) {
                logger.info(`id ${id} total is exceed ${QUANTITY_LIMIT / 2}`);
                if (!reportRecord[id].hasHalfNotify) {
                    quantityLimitNotify(id, QUANTITY_LIMIT, true).then(
                        () => {
                            reportRecord[id].hasHalfNotify = true;
                        },
                        e => logger.error(`id: ${id} 上报超过一半阈值，微信机器人提示失败`, e)
                    );
                }
            }
            // 超过阈值后，告警一次，并且丢弃上报
            if (total >= QUANTITY_LIMIT) {
                logger.info(`id ${id} total is exceed ${QUANTITY_LIMIT}`);
                if (!reportRecord[id].hasNotify) {
                    quantityLimitNotify(id, QUANTITY_LIMIT, false).then(
                        () => {
                            reportRecord[id].hasNotify = true;
                        },
                        e => logger.error(`id: ${id} 上报超过阈值，微信机器人告警失败`, e)
                    );
                }
                return false;
            }
        },
    };
};
