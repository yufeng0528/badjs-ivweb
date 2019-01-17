var child_process = require('child_process');
var mail = require('../utils/ivwebMail_for_single.js');
var moment = require('moment');
var path = require('path');
var orm = require('orm');
var pjConfig = require(path.join(__dirname, '..', 'project.json'));

var mysqlUrl = 'mysql://root:root@localhost:3306/badjs';

function constructEmail(items) {

    var html = ['<html>'];
    html.push('<head><style>tbody {text-align: center} td,th {padding: 4px; border-bottom: 1px solid #b7a2a2; border-right: 1px solid #b7a2a2;} table {border-top: 1px solid black;border-left: 1px solid black;} .red {color: red}</style></head>')
    html.push('<body><h2>BadJS服务器磁盘占用情况</h2>');
    html.push(`<h3>目前使用磁盘 <span class="red">${items[0].usedPercent}</span></h3>`);
    html.push('<h3>最近7天占用情况统计：</h3>');
    html.push(`<table><tr>
                <th>日期</th>
                <th>文件系统总容量(GB)</th>
                <th>剩余容量(GB)</th>
                <th>已用容量(GB)</th>
                <th>已用占比(%)</th>
               </tr>`);
    items.forEach(item => {
        var createTime = moment(item.createTime).format('YYYY-MM-DD hh:mm:ss');
        var fullSize = item.fullSize;
        var remains = item.remains;
        var usedSize = item.usedSize;
        var usedPercent = item.usedPercent;
        html.push(`<tr>
                    <td>${createTime}</td>
                    <td>${fullSize}</td>
                    <td>${remains}</td>
                    <td>${usedSize}</td>
                    <td class="red">${usedPercent}</td>
                   </tr>`);
    })

    html.push('</table><p>请注意及时清理BadJS磁盘</p></body></html>');
    return html.join('');
}

var mdb = orm.connect(mysqlUrl, function (err, db) {
    var hardware = db.define('b_hardware', {
        id: Number,
        fullSize: String,
        usedSize: String,
        remains: String,
        usedPercent: String,
        createTime: String
    });

    var child = child_process.spawn('df', ['-h']);

    child.stdout.on('data', (data) => {
        console.log('-------');
        console.log('badjs服务器磁盘占用情况');
        console.log(moment().format('YYYY-MM-DD hh:mm:ss'));
        var list = data.toString().split(`\n`);
        list = list.filter(l => l.startsWith(`/dev`) && l.endsWith('/data')); // 这里要根据实际磁盘使用配置
        var res = list[0].split(/\s+/g);
        hardware.create({
            fullSize: Number.parseInt(res[1]),
            usedSize: Number.parseInt(res[2]),
            remains: Number.parseInt(res[3]),
            usedPercent: res[4],
            createTime: new Date()
        }, function () {
            hardware.find({}, ['id', 'Z'], 7, function (err, items) {
                if (!err) {
                    var html = constructEmail(items);
                    if (pjConfig.scoreMailToOwner) {
                        mail('', pjConfig.scoreMailToOwner, '', 'BadJS服务器磁盘占用情况', html, '', true);
                    } else {
                        console.log(html);
                    }
                }
                mdb.close();
            });
        });
    });

    child.stderr.on('data', (data) => {
        console.log(moment().format('YYYYMMDD hh:mm:ss'));
        console.log('-------');
        console.log('stderr: ' + data);
        console.log('-------');
        mdb.close();
        setTimeout(() => {
            process.exit();
        }, 3000);
    });

    child.on('close', (code) => {
        console.log('child process exited with code ' + code);
    });

});


