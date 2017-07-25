
const fs = require('fs');
const readline = require('readline');
const orm = require('orm');

const getImgLib = require('../lib/getImg.js');

console.log(process.argv);
var filePath = process.argv[2];
var date = process.argv[3]
var pv = {}, pvlist = [], badjsid;

var mysqlUrl  = 'mysql://root:root@localhost:3306/badjs';

var getYesterday = function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
};



const rs = fs.createReadStream(filePath, 'utf8');

const rl  = readline.createInterface({
    input: rs,
    output: null // process.stdout
});

rl.on('line', (input) => {
	var r  = /\/badjs\/(\d+)/g.exec(input);

	if (r) {
	    badjsid = r[1];
	    if (!pv[badjsid]) {
	        pv[badjsid] = 1;
	    } else {
	        pv[badjsid] += 1;
	    }
	}
})


rl.on('close', () => {
    console.log('文件读完了。')
    for(i in pv) {

	pvlist.push({
	    badjsid: i - 0,
	    pv: pv[i],
	    date: date -0
	})
    }


    console.log(pvlist);

    var mysqlUrl  = 'mysql://root:root@localhost:3306/badjs';

    var mdb = orm.connect(mysqlUrl, function(err, db){

		//createScore(db, pvlist);
		//return;
	var pv = db.define("b_pv", {
	    id          : Number,
	    badjsid          : Number,
	    pv          : Number,
	    date          : Number
	});


	pv.create(pvlist, function(err, items) {
	    if (!err) {
		console.log('ok')

		// 插入score
		createScore(db, pvlist);
	    } else {
		console.log(err);
	    }
	})

    });

})


var handleScore = function (pv, e_pv) {
    
    // 算分
    var e_rate = e_pv / pv;
    var score;
    if (e_rate <= 0.005) {
	score = 100;
    } else if (e_rate < 0.1 && e_rate > 0.005) {
	score = 100 - 10 * e_rate;
    } else {
	score = 0;
    }

    return score.toFixed(2);

}

function createScore(db, pvlist) {

    var Statistics = db.define('b_statistics',  {
	id: Number,
	projectId: Number, 
	startDate : Date,
	endDate : Date,
	content: String,
	total : Number
    });

    var param = {
        startDate: getYesterday()
    };

    console.log(param);

    Statistics.find(param, (err, data) => {
	var scoreList = [];

        if (err) {
	    console.log('error')
	    console.log(err)
	} else {

	    data.forEach(item => {
		var proId  = item.projectId,
		badjsTotal = item.total,
		pv, score;

		pvlist.forEach(item => {
		    if (item.badjsid == proId) {
		        pv = item.pv;
		    }
		})

		score = handleScore(pv, badjsTotal)

		scoreList.push({
		    badjsid: proId,
		    score: score,
		    date: date - 0
		});
	    })
	    console.log(scoreList);

	    var Score = db.define('b_score',  {
		id: Number,
		badjsid: Number, 
		score: String,
		date : Number
	    });

	    Score.create(scoreList, function(err, data) {
                mdb.close();
		if (!err) {
		    console.log('ok')

		    // 生成图片
		    
//		    handleScoreImg(Score);

		} else {
		    console.log(err);
		}
	    })

	    
	}

	// orm.close();
    })


}

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

function getScoreData(param) {

    return new Promise((resolve, reject) => {
        param.dao.find().order('-date')
        .where('date', '>', param.date)
        .all((err, items) => {
            resolve(items);
        })
    })
}

function handleScorePic(Score) {

    // 创建参数 日期
    var param = getScoreParam(Score); 
    // 拿到数据
    getScoreData(param).then(data => {
        // 调用图像接口获得图像
        
        return getImgLib(data, {
            busId: 'badjsid',
            key: 'date',
            value: 'score',
            tableName: 'badjs score last 30 days line charts',
            valueName: 'scoret',
            path: '/static/scoreimg/'

        });
    }).then(result => {
        console.log(result);
    })
    



}

exports.module = {
    handleScorePic
}

