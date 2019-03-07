const Promise = require('bluebird');
const moment = require('moment');
const orm = require('orm');
const cp = require('child_process');
const request = require('request');
const pjConfig = require('../project.json');
const getScore = require('../lib/getScore.js');
const mysqlUrl = 'mysql://root:root@localhost:3306/badjs';

var mdb = orm.connect(mysqlUrl, function (err, db) {

    const yesterday = moment().subtract(2, 'day').format('YYYYMMDD') - 0;

    const sql = 'select s.*, a.userName, a.name from b_quality as s, b_apply as a where s.badjsid=a.id and a.status=1 and a.online=2 and s.pv>a.limitpv and s.rate > 0.5 and s.date>' + yesterday + ' order by s.rate desc;';
    db.driver.execQuery(sql, (err, data) => {
        mdb.close();

        if (!data.length) return;

        const mentioned_list = [];

        const base = `#### Badjs昨日统计扣分项目共<font color=\"warning\"> ${data.length} </font>例，请相关同事注意。\n \n`;

        const msg = base + data.map(d => {
                mentioned_list.push(d.userName);
                const score = getScore.handleScore(d.pv, d.badjscount);
                return `> ${d.badjsid}-${d.name} - (得分：<font color="info">${score}</font>)`;
            }).join('\n') +
            `\n \n #### 查看 [Badjs](http://badjs2.ivweb.io) 定位问题。`;

        const options = {
            url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${pjConfig.wechat}`,
            method: 'POST',
            json: {
                'msgtype': 'markdown',
                'markdown': {
                    'content': msg
                }
            }
        };

        const options2 = {
            url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=b5865478-7828-497f-9b4e-f1f4b406188c',
            method: 'POST',
            json: {
                'msgtype': 'text',
                'text': {
                    content: '请相关同事注意。',
                    mentioned_list
                }
            }
        };

        request(options, function (err, res, body) {
            if (!err) {
                // request(options2, function (err, res, body) {
                //     console.log(body);
                // });
            }
        });
    });
});

