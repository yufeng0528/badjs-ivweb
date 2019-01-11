/**
 *  @info: sourceMapDao
 *  @author: tickli
 *  @date: 2019-01-11
 */

module.exports = function (db) {
    return db.define("b_sourcemap", {
        id: Number,
        project: String,
        name: String,
        path: String,
        createTime: Date
    });
};

