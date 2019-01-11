var express = require('express');
var tpl = require('express-micro-tpl');
var crypto = require('crypto');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');
var app = express();
var router = require('../controller/router');
var compress = require('compression');
var orm = require('orm');
var pluginHandler = require('./PluginWorker');
var path = require('path');

var log4js = require('log4js'),
    logger = log4js.getLogger();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'html');
app.engine('html', tpl.__express);
app.use(compress());
app.use(session({secret: 'keyboard cat', cookie: {maxAge: 120 * 60 * 1000}}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({}));
app.use(cookieParser());
app.use('/static', serveStatic(path.join(__dirname, '..', 'static')));


var msqlUrl = global.pjconfig.mysql.url;


logger.info('connect mysql: ' + msqlUrl);


app.use(orm.express(msqlUrl, {
    define: function (db, models, next) {

        db.use(require('orm-transaction'));
        models.userDao = require('../dao/UserDao')(db);
        models.applyDao = require('../dao/ApplyDao')(db);
        models.sourcemapDao = require('../dao/sourcemapDao')(db);
        models.approveDao = require('../dao/ApproveDao')(db);
        models.userApplyDao = require('../dao/UserApplyDao')(db);
        models.statisticsDao = require('../dao/StatisticsDao')(db);
        models.pvDao = require('../dao/PvDao')(db);
        models.scorevDao = require('../dao/ScoreDao')(db);
        models.db = db;

        global.models = models;
        logger.info('mysql connected');
        next();
    }
}));

app.use(function (err, req, res, next) {
    res.send(err.stack);
});

if (global.pjconfig.oos && global.pjconfig.oos.module) {
    app.use('/user', require('../oos/' + global.pjconfig.oos.module));
}


app.use('/user', function (req, res, next) {
    if (pluginHandler.login) {
        pluginHandler.login.check(req, res, next);
    } else {
        if (!req.session.user) {
            res.redirect(req.protocol + '://' + req.get('host') + '/login.html');
            return;
        } else {
            next();
        }
    }
});

router(app);

// 注册插件路由事件
pluginHandler.registerRoute(app);

logger.info('Listen At Port: ' + GLOBAL.pjconfig.port);
var port = parseInt(GLOBAL.pjconfig.port, 10) || 80;
module.exports = function () {
    app.listen(port);

    logger.info('start badjs-web , listen ' + port + ' ...');
};
