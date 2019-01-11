/**
 * Created by tickli on 2019/01/11.
 */


var SourceMapService = function () {
    this.sourcemapDao = global.models.sourcemapDao;
};

SourceMapService.prototype = {
    query: function (target, callback) {
        this.sourcemapDao.find({
            userName: target.user.loginName
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
    add: function (target, callback) {
        this.sourcemapDao.create(target, function (err, items) {

        });

    },
    remove: function (target, callback) {

    },
    update: function (target, callback) {
    }
}


module.exports = SourceMapService;
