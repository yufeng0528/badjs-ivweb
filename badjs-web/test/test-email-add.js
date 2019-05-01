var mysql = require('mysql'),
    orm = require('orm');
const pjConfig = require('../project.json');

const mysqlUrl = pjConfig.mysql.url;

orm.connect(mysqlUrl, function (err, db) {
    if (err) {
        throw err;
    }

    var userDao = require('../dao/UserDao')(db)

    userDao.find({}, function (err, item) {

        item.forEach(function (value) {
            value.email = value.loginName + "@xx.com";
            value.save();
        })


    })

});





