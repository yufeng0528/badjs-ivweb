/**
 * @info : SOURCEMAP ACION
 * @author : tickli
 * @date : 2019-01-11
 */

var _ = require('underscore');
var SourceMapService = require('../../service/SourceMapService');

var sourceMapAction = {

    add: function (params) {
        var service = new SourceMapService();
        service.query({
            project: params.project,
            name: params.name
        }, function (err, res) {
            if (!res) {
                service.add(params, function (err, items) {
                    console.log(items);
                });
            }
        });
    },
    queryByApplyId: function (params, cb) {
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
    }

};

module.exports = sourceMapAction;
