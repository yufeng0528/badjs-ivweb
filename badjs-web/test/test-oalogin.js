var http = require('http');
const code = '7hHsJI39QVrAzuoivwbD8kUSbpq3GsnaDvOqPUMIw-g.'
const url = `http://now.qq.com/zxjg/cgi-bin/tofhander/?type=1&code=${code}`;
const url1 = `http://idc.esb.oa.com:8080/TOF/api/PassportTicket/Accesstoken?appkey=6f0611791dbc4a59a0f6f17f7bc8783c&code=${code}`;

http.get(url, _res => {
    const statusCode = _res.statusCode;
    console.log('tof_handler:', statusCode)
    if (statusCode !== 200) {
        console.log(statusCode);
    } else {
        var rawData = '';
        _res.setEncoding('utf8');
        _res.on('data', chunk => {
            rawData += chunk;
        });
        _res.on('end', () => {
            const parseData = JSON.parse(rawData);
            console.log(parseData);
        });
    }
})
