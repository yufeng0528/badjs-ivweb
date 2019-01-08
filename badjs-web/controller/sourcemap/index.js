var path = require('path');
var fs = require('fs');
var multer = require('multer');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var soucemap = GLOBAL.pjconfig.sourcemap;

function removePromise(dir) {
    return new Promise(function (resolve, reject) {
        //先读文件夹
        fs.stat(dir, function (err, stat) {
            if (stat.isDirectory()) {
                fs.readdir(dir, function (err, files) {
                    files = files.map(file => path.join(dir, file));
                    files = files.map(file => removePromise(file));
                    Promise.all(files).then(function () {
                        fs.rmdir(dir, resolve);
                    });
                });
            } else {
                fs.unlink(dir, resolve);
            }
        });
    });
}


// 保留最后三个版本的数据
function removeFolder(fold) {
    fs.stat(fold, function (err, stat) {
        if (!err) {
            fs.readdir(fold, function (err, stat) {
                stat = stat.filter(s => !isNaN(s));
                var diff = stat.length - 3;
                if (diff > 0) {
                    stat.sort();
                    for (var i = 0; i < diff; i++) {
                        removePromise(path.join(fold, stat[i]));
                    }
                }
            });
        }
    });
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var projectName = req.body.projectName || 'no-project';
        var time = new Date().getTime() + '';
        var filepath = path.join(soucemap, projectName + '/', time);
        mkdirp(filepath, function (err) {
            if (!err) {
                cb(null, filepath);
            }
        });
        // 异步删除文件夹
        removeFolder(path.join(soucemap, projectName));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var fileFilter = function (req, file, cb) {
    if (file.originalname.endsWith('.map')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 10
    },
    fileFilter: fileFilter
});

module.exports = upload;
