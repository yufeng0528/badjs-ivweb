const moment = require('moment');
const getScore = require('../lib/getScore.js');
const hhScore = require('./handle-hongheibang.js');
const getLogDataInt = require('./get_log_data.js');

const pjConfig = require('../project.json');

const mail = require('../utils/ivwebMail_for_single.js');

function getScoreParam (Score) {
    const param = {
        dao: Score
    };

    param.date = moment().subtract(2, 'day').format('YYYYMMDD') - 0;

    return param;
}

function getScoreData (param, db) {

    return new Promise((resolve, reject) => {
        const sql = 'select s.*, a.name from b_quality as s, b_apply as a where s.badjsid=a.id and a.status=1 and s.pv>0 and s.date>' + param.date + ' order by s.date;';
        db.driver.execQuery(sql, (err, data) => {
            resolve(data);
        });
    });
}

function getApplyList (db) {
    return new Promise((resolve, reject) => {
        const sql = 'select * from b_apply where status=1;';
        db.driver.execQuery(sql, (err, data) => {
            resolve(data);
        });
    });
}


function handleScoreMail (Score, db, closeCallback) {

    // 创建参数 日期
    let param = getScoreParam(Score),
        getScore_pro = getScoreData(param, db),
        getApply_pro = getApplyList(db),
        gethhScore = hhScore(db),
        getLogData = getLogDataInt(db),
        hhd = '',
        logdata = '';

    // 拿到数据
    Promise.all([getScore_pro, getApply_pro, gethhScore, getLogData]).then(data => {
        const applyList = data[1];

        hhd = data[2];
        logdata = data[3];

        const applyMap = {};
        applyList.forEach(item => {
            applyMap[item.id] = item.name + ' ' + item.userName;
        });

        closeCallback();
        return data;

    }).then(data => {

        let scoreData = data[0],
            applyList = data[1];

        const yestday = moment().subtract(1, 'day').format('YYYYMMDD') - 0;

        // 生成表格
        // 因为只要昨天的数据，所以这里线过滤一下数据
        scoreData = scoreData.filter(item => {
            return item.date == yestday;
        });
        if (!scoreData.length) {
            return '';
        }

        applyList.forEach(item => {

            scoreData.forEach(item2 => {
                if (item.id == item2.badjsid) {
                    item.rate = item2.rate;
                    item.pv = item2.pv;
                    item.badjscount = item2.badjscount;
                    item.date = item2.date;
                }
            });

            if (item.pv > 0 && item.badjscount >= 0) {
                item.score = getScore.handleScore(item.pv, item.badjscount) - 0;
            }
        });

        // sort by pv
        applyList = applyList.map(item => {
            if (item.score === undefined)
                item.score = 110;
            return item;

        }).sort((a, b) => {
            if (a.score < b.score) {
                return -1;
            } else if (a.score > b.score) {
                return 1;
            } else {
                if (a.rate < b.rate) {
                    return 1;
                } else if (a.rate > b.rate) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });

        const applyList_offline = [];
        applyList = applyList.filter(item => {
            if (item.online == 2 && item.pv > 0 && item.limitpv < item.pv) {
                return true;
            } else {
                applyList_offline.push(item);
            }
        });

        applyList = applyList.concat(applyList_offline);

        const html = ['<html><h2>IVWEB Badjs 质量评分日报</h2>'];

        html.push('<style>td,th {border-bottom: 1px solid #b7a2a2;border-right: 1px solid #b7a2a2;} table {border-top: 1px solid black;border-left: 1px solid black;} </style>');
        html.push('<table border="0" cellspacing="0" cellpadding="0"><tr><th>业务名称</th><th>负责人</th><th>评分</th><th>错误率</th><th>pv</th><th>badjs错误量</th><td>上线</th><th>最低PV阈值</td><th>日期</th></tr>');
        applyList.forEach(item => {

            html.push('<tr>');
            html.push(`<td>${item.name}</td>`);
            html.push(`<td>${item.userName}</td>`);

            html.push(`<td>${item.score > 100 ? '-' : item.score}</td>`);

            item.online = item.online == 2 ? '上线' : '下线';

            ['rate', 'pv', 'badjscount', 'online', 'limitpv', 'date'].forEach(item2 => {
                html.push(`<td>${item[item2] !== undefined ? item[item2] : '-'}</td>`);
            });

            html.push('</tr>');
        });

        html.push('</table>');

        html.push('<p>注：badjs得分规则</p> <p>（1）当报错率 <= 0.5%： badjs得分=100</p> <p>（2）当 0.5%< 报错率 < 10%：badjs得分： 100 - 10 * 报错率</p> <p>（3）当报错率 >= 10%： badjs得分=0</p>');

        html.push(hhd);
        html.push(logdata);
        html.push(logdata);

        html.push('</html>');

        return html.join('');


    }).then((html) => {
        setTimeout(() => {
            if (html) {
                sendMail(html);
            } else {
                sendErrorMail();
            }
        }, 10000);
    });
}

function sendErrorMail () {
    mail('', pjConfig.errorMailTo, '', 'IVWEB badjs质量评分日报错误', '请检查是否磁盘已满并且重新发送邮件', '', true);
}

function sendMail (html) {
    console.log('start send mail');

    mail('', pjConfig.scoreMailTo, '', 'IVWEB badjs质量评分日报', html, '', true);
}

module.exports = {
    handleScoreMail: handleScoreMail
};

