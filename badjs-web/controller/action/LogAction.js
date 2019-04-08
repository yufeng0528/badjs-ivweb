'use strict';
/**
 * @info : LOG ACION
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogService = require('../../service/LogService');
var http = require('http');
var pjConfig = require('../../project.json');
var IP2Region = require('ip2region');
var fs = require("fs");
var path = require("path");

var isError = function (res, error) {
    if (error) {
        res.json({ ret: 1, msg: error });
        return true;
    }
    return false;
};


var LogAction = {
    queryLogList2: function (params, req, res) {

        var logService = new LogService();
        const ipquery = new IP2Region();
        params['endDate'] -= 0;
        params['startDate'] -= 0;
        params['id'] -= 0;
        delete params.user;
        logService.query(params, function (err, items) {
            if (isError(res, err)) {
                return;
            }

            items.forEach((item) => {
                if(item.ip) {
                    const res = ipquery.query(item.ip);
                    
                    item.country = res.country;
                    item.region = res.region;
                    item.province = res.province;
                    item.city = res.city;
                    item.isp = res.isp;
                }
            });

            res.json({ ret: 0, msg: "success-query", data: items });
        });
    },

    queryLogList: function (params, req, res) {
        var logService = new LogService();
        
        params['endDate'] -= 0;
        params['startDate'] -= 0;
        params['id'] -= 0;
        delete params.user;
        logService.query(params, function (err, items) {
            if (isError(res, err)) {
                return;
            }

            res.json({ ret: 0, msg: "success-query", data: items });
        });
    },

    showOfflineFiles: function (params, req, res) {
        if (!params.id) {
            res.json({ ret: 0, msg: "success-query", data: [] });
            return;
        }

        var filePath = path.join(pjConfig.offline_log, params.id + "");


        if (!fs.existsSync(filePath)) {
            res.json({ ret: 0, msg: "success-query", data: [] });
            return;
        }

        var offlineFiles = fs.readdirSync(filePath);
        var offlineFilesList = [];
        offlineFiles.sort(function (a, b) {
            if (a < b) {
                return 1;
            } else {
                return -1;
            }
        });

        offlineFiles = offlineFiles.slice(0, 50);

        offlineFiles.forEach(function (item) {
            offlineFilesList.push({
                id: item
            });
        });

        res.json({ ret: 0, msg: "success-query", data: offlineFilesList });


    },

    showOfflineLog: function (params, req, res) {
        if (!params.fileId || !params.id) {
            res.json({ ret: 0, msg: "success-query", data: '' });
            return;
        }

        var filePath = path.join(pjConfig.offline_log, params.id + "", params.fileId);

        if (!fs.existsSync(filePath)) {
            res.json({ ret: 0, msg: "success-query", data: '' });
            return;
        }

        var offlineFiles = fs.readFileSync(filePath);

        res.json({ ret: 0, msg: "success-query", data: offlineFiles.toString() });


    },

    deleteOfflineLogConfig: function (params, req, res) {
        if (!params.id || !params.uin) {
            res.json({ ret: 0, msg: "", data: {} });
            return;
        }

        if (global.offlineLogMonitorInfo[params.id] && global.offlineLogMonitorInfo[params.id][params.uin]) {
            delete global.offlineLogMonitorInfo[params.id][params.uin];
        }

        res.json({ ret: 0, msg: "", data: {} });
    },

    getOfflineLogConfig: function (params, req, res) {
        if (!params.id) {
            res.json({ ret: 0, msg: "", data: {} });
            return;
        }

        var result = {};
        if (global.offlineLogMonitorInfo[params.id]) {
            result = global.offlineLogMonitorInfo[params.id];
        }

        res.json({ ret: 0, msg: "", data: result });
    },

    addOfflineLogConfig: function (params, req, res) {
        if (!params.id || !params.uin) {
            res.json({ ret: -1, msg: "", data: {} });
            return;
        }

        if (!global.offlineLogMonitorInfo[params.id]) {
            global.offlineLogMonitorInfo[params.id] = {};
        }

        var hadAdd = false;
        if (!global.offlineLogMonitorInfo[params.id][params.uin]) {
            global.offlineLogMonitorInfo[params.id][params.uin] = true;
        } else {
            hadAdd = true;
        }


        res.json({ ret: 0, msg: "success-query", data: { hadAdd: hadAdd } });
    },

    code: function (params, req, res) {
        http.get(params.target, function (response) {
            var buffer = '';
            response.on('data', function (chunk) {
                buffer += chunk.toString();
            }).on('end', function () {
                res.json({ ret: 0, msg: "success-query", data: buffer });
            });
        });
    }
};

module.exports = LogAction;

