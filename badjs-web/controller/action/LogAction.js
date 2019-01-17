/**
 * @info : LOG ACION
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogService = require('../../service/LogService'),
    log4js = require('log4js'),
    http = require('http'),
    logger = log4js.getLogger(),
    isError = function (res, error) {
        if (error) {
            res.json({ret: 1, msg: error});
            return true;
        }
        return false;
    };

var fs = require("fs")
var path = require("path")

var LogAction = {
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

            res.json({ret: 0, msg: "success-query", data: items});
        });
    },
    showOfflineFiles: function (params, req, res) {
        res.json({
            "ret": 0,
            "msg": "success-query",
            "data": [{"id": "632789064_1546004229720_1546436229720"}, {"id": "632789064_1545979117514_1546411117514"}, {"id": "380034641_1547292407396_1547724407396"}, {"id": "380034641_1547268409175_1547700409175"}, {"id": "380034641_1547268240408_1547700240408"}, {"id": "380034641_1547268204447_1547700204447"}, {"id": "380034641_1547268162866_1547700162866"}, {"id": "380034641_1547131295586_1547563295586"}, {"id": "380034641_1546004229720_1546436229720"}, {"id": "380034641_1546004184720_1546436184720"}, {"id": "380034641_1546000909817_1546432909817"}, {"id": "380034641_1546000870835_1546432870835"}, {"id": "380034641_1545989806921_1546421806921"}, {"id": "380034641_1545982815386_1546414815386"}, {"id": "173124608_1546004126720_1546436126720"}, {"id": "173124608_1545981263906_1546413263906"}, {"id": "173124608_1545979117514_1546411117514"}]
        })
        return
        if (!params.id) {
            res.json({ret: 0, msg: "success-query", data: []});
            return
        }

        var filePath = path.join(__dirname, '..', '..', 'offline_log', params.id + "");


        if (!fs.existsSync(filePath)) {
            res.json({ret: 0, msg: "success-query", data: []});
            return
        }


        var offlineFiles = fs.readdirSync(filePath);
        var offlineFilesList = [];
        offlineFiles.sort(function (a, b) {
            if (a < b) {
                return 1;
            } else {
                return -1;
            }
        })

        offlineFiles = offlineFiles.slice(0, 50);

        offlineFiles.forEach(function (item) {
            offlineFilesList.push({
                id: item
            })
        })

        res.json({ret: 0, msg: "success-query", data: offlineFilesList});


    },

    showOfflineLog: function (params, req, res) {

        res.json({
            "ret": 0,
            "msg": "success-query",
            "data": `{"logs":[{"id":453,"uin":"380034641","time":1547724064892,"version":3,"msg":"info","level":2,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724064893,"version":3,"msg":"debug","level":1,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724064894,"version":3,"msg":"error","from":"https://now.qq.com/index.html","level":4},{"id":453,"uin":"380034641","time":1547724064894,"version":3,"msg":"offline log","level":20,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724064894,"version":3,"msg":"offline log","level":20,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724139448,"version":3,"msg":"info","level":2,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724139449,"version":3,"msg":"debug","level":1,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724139449,"version":3,"msg":"error","from":"https://now.qq.com/index.html","level":4},{"id":453,"uin":"380034641","time":1547724139449,"version":3,"msg":"offline log1547724139449","level":20,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724139449,"version":3,"msg":"offline log1547724139449","level":20,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724398020,"version":3,"msg":"info","level":2,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724398022,"version":3,"msg":"debug","level":1,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724398022,"version":3,"msg":"error","from":"https://now.qq.com/index.html","level":4},{"id":453,"uin":"380034641","time":1547724398022,"version":3,"msg":"offline log1547724398022","level":20,"from":"https://now.qq.com/index.html"},{"id":453,"uin":"380034641","time":1547724398022,"version":3,"msg":"offline log1547724398022","level":20,"from":"https://now.qq.com/index.html"}],"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36","startDate":1547292407396,"endDate":1547724407396,"id":453,"uin":"380034641"}`
        })
        return
        if (!params.fileId || !params.id) {
            res.json({ret: 0, msg: "success-query", data: ''});
            return
        }

        var filePath = path.join(__dirname, '..', '..', 'offline_log', params.id + "", params.fileId);


        if (!fs.existsSync(filePath)) {
            res.json({ret: 0, msg: "success-query", data: ''});
            return;
        }


        var offlineFiles = fs.readFileSync(filePath);

        res.json({ret: 0, msg: "success-query", data: offlineFiles.toString()});


    },

    deleteOfflineLogConfig: function (params, req, res) {
        if (!params.id || !params.uin) {
            res.json({ret: 0, msg: "", data: {}});
            return
        }


        if (global.offlineLogMonitorInfo[params.id] && global.offlineLogMonitorInfo[params.id][params.uin]) {
            delete global.offlineLogMonitorInfo[params.id][params.uin]
        }

        res.json({ret: 0, msg: "", data: {}});
    },

    getOfflineLogConfig: function (params, req, res) {
        if (!params.id) {
            res.json({ret: 0, msg: "", data: {}});
            return
        }

        var result = {};
        if (global.offlineLogMonitorInfo[params.id]) {
            result = global.offlineLogMonitorInfo[params.id];
        }

        res.json({ret: 0, msg: "", data: result});
    },

    addOfflineLogConfig: function (params, req, res) {
        if (!params.id || !params.uin) {
            res.json({ret: -1, msg: "", data: {}});
            return
        }

        if (!global.offlineLogMonitorInfo[params.id]) {
            global.offlineLogMonitorInfo[params.id] = {}
        }

        var hadAdd = false;
        if (!global.offlineLogMonitorInfo[params.id][params.uin]) {
            global.offlineLogMonitorInfo[params.id][params.uin] = true;
        } else {
            hadAdd = true;
        }


        res.json({ret: 0, msg: "success-query", data: {hadAdd: hadAdd}});
    },

    code: function (params, req, res) {
        http.get(params.target, function (response) {
            var buffer = '';
            response.on('data', function (chunk) {
                buffer += chunk.toString();
            }).on('end', function () {
                res.json({ret: 0, msg: "success-query", data: buffer});
            });
        })
    }
};

module.exports = LogAction;

