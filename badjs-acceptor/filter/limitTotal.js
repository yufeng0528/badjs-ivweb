const log4js = require('log4js');
const logger = log4js.getLogger();

const { quantityLimitNotify } = require('../service');

const QUANTITY_LIMIT = 100000;
let reportRecord = {};

const endDate = new Date();
// 当前下一个整点
endDate.setHours(endDate.getHours(), 60, 0, 0);

// 每隔1小时（整点）清理上报记录
const CLEAR_INTERVAL = 60 * 60 * 1000;
const runIntervalClear = function() {
    setInterval(function() {
        logger.info(`[${process.pid}] clear report records.`);
        reportRecord = {};
    }, CLEAR_INTERVAL);
};

logger.info('after ' + (endDate - new Date()) + ' run limit monitor clear');
setTimeout(function() {
    runIntervalClear();
}, endDate - new Date());

/**
 * Created by chriscai, 为后面的服务减少压力
 * 限制进程每个小时最大上报 200000
 */
module.exports = function() {
    return {
        process: function(data) {
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

            // 超过阈值后，告警一次，并且丢弃上报
            if (total >= QUANTITY_LIMIT) {
                if (!reportRecord[id].hasNotify) {
                    logger.info(`[${process.pid}] id ${id} total is exceed ${QUANTITY_LIMIT}`);
                    reportRecord[id].hasNotify = true;
                    quantityLimitNotify(id, QUANTITY_LIMIT, false);
                }
                return false;
            }

            // 超过一半阈值后，提示一次异常
            if (total >= QUANTITY_LIMIT / 2) {
                if (!reportRecord[id].hasHalfNotify) {
                    logger.info(`[${process.pid}] id ${id} total is exceed ${QUANTITY_LIMIT / 2}`);
                    reportRecord[id].hasHalfNotify = true;
                    quantityLimitNotify(id, QUANTITY_LIMIT, true);
                }
            }
        }
    };
};
