var map = require('map-stream');
var zmq = require('zmq');
var client = zmq.socket('sub');
var port = global.pjconfig.acceptor.port;
var address = global.pjconfig.acceptor.address;
var service = global.pjconfig.acceptor.subscribe;

/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
    var stream = map(function (data, fn) {
        fn(null, data);
    });
    client.connect("tcp://" + address + ":" + port);
    client.subscribe(service);
    client.on('message', function (data) {
        stream.write(data);
    });
    return stream;
};
