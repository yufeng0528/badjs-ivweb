var log4js = require('log4js'),
    logger = log4js.getLogger();

var limitTotal = {};

var endDate = new Date;
endDate.setHours(endDate.getHours(), 60, 0, 0);

var runIntervalClear = function () {
    setInterval(function () {
        limitTotal = {};
    }, 1800000);
};

logger.info("after " + (endDate - new Date) + " run limit monitor clear");
setTimeout(function () {
    runIntervalClear();
}, endDate - new Date);


/**
 * Created by chriscai, 为后面的服务减少压力
 * 限制进程每个小时最大上报 200000
 */
module.exports = function () {
    return {
        process: function (data) {
            var arr = data.data;
            var id = arr ? arr[0].id : null;
            if (!id) {
                return false;
            }

            var total = 0;
            if (!limitTotal[id]) {
                total = limitTotal[id] = arr.length;
            } else {
                limitTotal[id] += arr.length;
                total = limitTotal[id];
            }

            if (total >= 200000) {
                console.log("id " + id + " total is exceed 200000");
                return false;
            }
        }
    };
};
