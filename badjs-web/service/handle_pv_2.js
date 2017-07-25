
const Promise = require('bluebird');
const getImgLib = require('../lib/getImg.js');

const mail = require("../utils/ivwebMail.js");

function getScoreParam(Score) {
    var param = {
        dao: Score
    };

    var d, day_30_time, day_30, startDate;
    d = new Date();
    day_30_time = d.getTime() - 30 * 24 * 60 * 60 * 1000;
    day_30 = new Date(day_30_time);
    startDate = (day_30.toISOString().split(/\D/).slice(0, 3).join('') - 0);

    param.date = startDate;

    return param;
}

function getScoreData(param, db) {

    return new Promise((resolve, reject) => {

        var sql = "select s.*, a.name from b_score as s, b_apply as a where s.badjsid=a.id and s.date>" + param.date + " order by s.date;";
        db.driver.execQuery(sql, (err, data) => {
            resolve(data);

        });

        /*
        param.dao.find().order('date')
        .where('date', '>', param.date)
        .all((err, items) => {
            resolve(items);
        })
        */
    })
}

function handleScorePic(Score, db, closeCallback) {

    // 创建参数 日期
    var param = getScoreParam(Score); 
    // 拿到数据
    getScoreData(param, db).then(data => {

            closeCallback();

        // 调用图像接口获得图像
        
        return getImgLib(data, {
            busId: 'badjsid',
            key: 'date',
            value: 'score',
            tableName: 'badjs score last 30 days line charts',
            valueName: 'score',
            path: '/static/scoreimg/'

        });

    }).then(list => {
        setTimeout(() => {
             sendMail(list);
        }, 5000)
    })
}


function sendMail(list) {

    console.log('start send mail');

    const r = 123; //new Date().getTime();
    var ac = [];

    content = [];
    content.push('<html>');

    for(var i in list) {

        content.push('<p>'+list[i][0].name+'</p>')
        content.push('<img src="cid:' + r + i + '">')

        var yestday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split(/\D/).slice(0, 3).join('');

        ac.push({
            filename: r + i + '.png',
            path: 'http://badjs.now.qq.com/static/scoreimg/' + yestday + '-'+ i + '.png',
            cid: r + i
        });
    }
        

    content.push('</html>');

    var attachments =  ac;

    mail('', 'herbertliu@tencent.com,kurtshen@tencent.com,lindazhu@tencent.com,linjianghe@tencent.com,linkzhu@tencent.com,richcao@tencent.com,ryanjschen@tencent.com,sampsonwang@tencent.com,seanxie@tencent.com,willliang@tencent.com,xuchenzhang@tencent.com,zhuoyingmo@tencent.com,lewischeng@tencent.com,adamhe@tencent.com,kevinyyang@tencent.com,jeremygao@tencent.com,jimmytian@tencent.com,qiuqiuqiu@tencent.com,bilibiliou@tencent.com', 'sampsonwang@tencent.com', 'IVWEB badjs质量评分日报', content.join(''), attachments);
    // mail('', 'sampsonwang@tencent.com', 'sampsonwang@tencent.com', 'IVWEB badjs质量评分日报', content.join(''), attachments);

}

module.exports = {
    getImg: handleScorePic
}

