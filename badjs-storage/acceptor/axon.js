var map = require('map-stream');
var mq = require('axon');
var client = mq.socket('sub');
var port = GLOBAL.pjconfig.acceptor.port;
var address = GLOBAL.pjconfig.acceptor.address;
var service = GLOBAL.pjconfig.acceptor.subscribe;

/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
    var stream = map(function (data, fn) {
        fn(null, data);
    });
    client.connect("tcp://" + address + ":" + port);
    client.subscribe(service + "*");
    client.on('message', function (data) {
        stream.write(data);
    });
    return stream;
};
