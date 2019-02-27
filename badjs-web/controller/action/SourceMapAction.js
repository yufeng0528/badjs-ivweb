/**
 * @info : SOURCEMAP ACION
 * @author : tickli
 * @date : 2019-01-11
 */

var _ = require('underscore');
var SourceMapService = require('../../service/SourceMapService');
var child_process = require('child_process');

var sourceMapAction = {
    add: function (params) {
        var service = new SourceMapService();
        service.query({
            project: params.project,
            name: params.name,
            commit: params.commit
        }, function (err, res) {
            if (!err && !res.data.length) {
                service.add(params, function (err, items) {
                    console.log(items);
                });
            }
        });
    },
    query: function (params, cb) {
        var service = new SourceMapService();
        service.query({
            project: params.project,
            name: params.name
        }, function (err, sourcemap) {
            cb(err, sourcemap);
        });
    },
    update: function (params, req, res) {
    },
    remove: function (params, req, res) {
    },
    analytic: function (params, req, res) {
        if (!params.project || !params.filename || !params.row || !params.column) {
            return res.json({
                ret: 1002,
                msg: 'params error'
            });
        }
        var service = new SourceMapService();
        service.query({
            project: params.project,
            name: params.filename
        }, function (err, items) {
            if (!err) {
                if (items.data.length) {
                    var item = items.data[items.data.length - 1];
                    console.log(item.path);
                    child_process.exec(`sm ${params.filename} ${params.row} ${params.column} ${item.path}`,
                        function (err, stdout, stderr) {
                            if (!err) {
                                res.json({
                                    ret: 0,
                                    msg: 'success',
                                    data: stdout
                                });
                            } else {
                                res.json({ ret: 1, msg: err });
                            }
                        });
                } else {
                    res.json({ ret: 1, msg: 'no matched sourcemap file' });
                }
            } else {
                res.json({ ret: 1, msg: err });
            }
        });
    }

};

module.exports = sourceMapAction;
