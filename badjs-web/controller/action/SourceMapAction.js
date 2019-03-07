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
            name: params.name
        }, function (err, res) {
            if (!err && !res) {
                service.add(params, function (err, items) {
                    console.log(items);
                });
            }
        });
    },
    query: function (params, req, res) {
        var service = new SourceMapService();
        // var name = params.name.replace(/(\.js)$/ig, '.map');
        var name = params.name;
        service.query({
            name: name
        }, function (err, sourcemap) {
            if (err || !sourcemap) {
                return res.json({
                    ret: 1,
                    error: err || 'sourcemap file not exist'
                });
            }
            var project = sourcemap.project;
            var name = sourcemap.name;
            res.json({
                ret: 0,
                msg: "success-query",
                data: {
                    project: project,
                    name: name,
                    path: 'http://badjs2.ivweb.io/sm/' + project + '/' + name
                }
            });
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
                                res.json({ret: 1, msg: err});
                            }
                        });
                } else {
                    res.json({ret: 1, msg: 'no matched sourcemap file'});
                }
            } else {
                res.json({ret: 1, msg: err});
            }
        });
    }

};

module.exports = sourceMapAction;
