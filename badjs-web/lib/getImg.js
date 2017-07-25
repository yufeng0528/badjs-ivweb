var path = require('path')

var Promise = require('bluebird')
var logger = require('log4js').getLogger();
var exporting = require('node-highcharts-exporting');
var fs = require('fs');

 
// busId, key, value, tableName, valueName, path
module.exports = function(data, extParam) {

    var list = {};
    data.forEach(item => {
        var busKey = item[extParam.busId];

        if (!list[busKey]) {
            list[busKey] = [];
        }

        list[busKey].push(item);
    });
    
    console.log(list);
    for(var i in list) {
        saveImg(list[i], i, extParam);
    }

    return list;


}

function saveImg(items, busId, extParam) {

    var xdata = [], xkey = []; 

    items.forEach((item, index) => {

        xkey.push(item[extParam.key]);
        xdata.push(item[extParam.value] - 0);
    })



    var _d = {
        data: {
            width: 800,
            title: {
                text: ' ' 
            },
            xAxis: {
                categories: xkey
            },
            yAxis: {
                max: 100,
                min: 90,
                title: {
                    text: '%'
                }
            },
            series: [{
                data: xdata,
                name: extParam.valueName || 'badjs score'
            }]
        }
    };
    console.log(xkey);
    console.log(xdata);

    exporting(_d, (err, image)=> {
        if (err) {
            console.log(err);
        }
        var yestday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split(/\D/).slice(0, 3).join(''),
        imgFullPath = [extParam.path, '/', yestday, '-', busId, '.png'].join(''); 
        var _path = path.join(__dirname, "..", imgFullPath);
        console.log(_path);

        fs.writeFile(_path, new Buffer(image, 'base64'), function() {

        })
    })
}


