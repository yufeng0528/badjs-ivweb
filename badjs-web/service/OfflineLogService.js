/**
 * Created by chriscai on 2015/4/29.
 */

var fs = require('fs');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');

var app = express();

global.offlineLogMonitorInfo = {};

var log4js = require('log4js'),
    logger = log4js.getLogger();

var offlineLogMonitorPath = path.join(global.pjconfig.offline_log, 'offline_log_monitor.db');
try {
    global.offlineLogMonitorInfo = JSON.parse(fs.readFileSync(offlineLogMonitorPath).toString());
    logger.info('offline_log_monitor.db success ');
} catch (e) {
    logger.error('offline_log_monitor.db error ', e);
    fs.writeFile(offlineLogMonitorPath, fs.readFileSync(path.join(__dirname, 'offline_log_monitor.db')), function (err) {
        if (err) {
            logger.error('make file offline_log_monitor.db error ', err);
        } else {
            logger.log('make file offline_log_monitor.db success');
        }
    });
}

setInterval(function () {
    fs.writeFileSync(offlineLogMonitorPath, JSON.stringify(global.offlineLogMonitorInfo));
}, 3600000);

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/offlineLogCheck', function (req, res) {
    var param = req.query;
    if (param.id && param.uin && global.offlineLogMonitorInfo[param.id] && global.offlineLogMonitorInfo[param.id][param.uin]) {
        let key = global.offlineLogMonitorInfo[param.id][param.uin];
        if (param.delete) {
            delete global.offlineLogMonitorInfo[param.id][param.uin];
        }
        logger.info('should download offline log: ' + (param.id + '_' + param.uin));
        res.end(key);
    } else {
        res.end();
    }
});


/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {

    logger.info('offline service start ok...');
    app.listen(9010);

};
