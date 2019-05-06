var log4js = require('log4js'),
    logger = log4js.getLogger();

var path = require("path");
var argv = process.argv.slice(2);
var pos = require('./cache/pos');

if (argv.indexOf('--project') >= 0) {
    global.pjconfig = require(path.join(__dirname, 'project.debug.json'));
} else {
    global.pjconfig = require(path.join(__dirname, 'project.json'));
}

if (argv.indexOf('--debug') >= 0) {
    logger.level = 'DEBUG';
    global.debug = true;
} else {
    logger.level = 'INFO';
}

// 创建所需目录
pos();


global.MONGODB = global.pjconfig.mongodb;

var dispatcher = require(global.pjconfig.acceptor.module);
var save = require('./storage/MongodbStorage');

// use zmq to dispatch
dispatcher()
    .pipe(save());


logger.info('start badjs-storage success.');

setTimeout(function () {
    require('./service/query')();
    require('./service/autoClear')();
}, 1000);
