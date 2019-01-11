var child_process = require('child_process');
var mail = require('../utils/ivwebMail_for_single.js');
var moment = require('moment');
var pjConfig = require('../../project.debug.json');

var child = child_process.spawn('df', ['-h']);

child.stdout.on('data', (data) => {
    console.log('-------');
    console.log('badjs服务器磁盘占用情况');
    console.log(moment().format('YYYYMMDD hh:mm:ss'));
    var list = data.toString().split(`\n`);
    var title = list[0];
    list = list.filter(l => l.startsWith(`/dev`));
    list.unshift(title);
    data = list.join(`<br />`);
    mail('', pjConfig.scoreMailToOwner, '', 'badjs服务器磁盘占用情况', data, '', true);
    console.log(data);
    console.log('-------');
});

child.stderr.on('data', (data) => {
    console.log(moment().format('YYYYMMDD hh:mm:ss'));
    console.log('-------');
    console.log('stderr: ' + data);
    console.log('-------');
});

child.on('close', (code) => {
    console.log('child process exited with code ' + code);
});
