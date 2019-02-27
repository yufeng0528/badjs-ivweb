/**
 * Created by tickli on 2019/01/11.
 */


var SourceMapService = function () {
    this.sourcemapDao = global.models.sourcemapDao;
};

SourceMapService.prototype = {
    query: function (param, callback) {
        this.sourcemapDao.find({
            name: param.name,
            project: param.project
        }, function (err, items) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, {
                ret: 0,
                msg: "success",
                data: items
            });
        });
    },
    add: function (sourcemap, callback) {
        sourcemap.createTime = new Date();
        this.sourcemapDao.create(sourcemap, function (err, items) {
            callback(null, {
                ret: 0,
                msg: "success",
                data: items
            });
        });
    },
    remove: function (target, callback) {

    },
    update: function (target, callback) {
    }
};

module.exports = SourceMapService;
