const pjConfig = require('../project.json');
const fs = require('fs');
const path = require('path');

if (pjConfig.offline_log) {
    fs.readdir(pjConfig.offline_log, function (err, res) {
        if (!err) {
            res.forEach(function (dir) {
                const filePath = path.join(pjConfig.offline_log, dir);
                fs.readdir(filePath, function (err1, res1) {
                    if (!err1) {
                        res1.forEach(function (file) {
                            const date = file.split('_')[2];
                            // 删除 3 天前的离线日志
                            if (new Date().getTime() - date > 3 * 24 * 60 * 60 * 1000) {
                                fs.unlinkSync(path.join(pjConfig.offline_log, dir, file));
                            }
                        });
                    }
                });
            });
        }
    });
}
