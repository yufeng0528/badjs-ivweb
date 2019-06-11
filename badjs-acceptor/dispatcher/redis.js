const map = require('map-stream');
const redis = require('redis');
const client = redis.createClient();

/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
    var stream = map(function (data, fn) {
        client.publish('badjs', JSON.stringify(data));
    });
    return stream;
};
