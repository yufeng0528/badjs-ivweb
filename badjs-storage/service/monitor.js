const http = require('http');

let pool = [];
let sendTask = null;
let lastSend = 0;

const send = function () {
    lastSend = +new Date();
    http.get(`http://mp.now.qq.com/report/report_vm?monitors=[${pool.join(',')}]&_=${Math.random()}`, function () {});
    pool = [];
};

module.exports = function (id) {
    if (!id) return;

    if (Array.isArray(id)) {
        pool = pool.concat(id);
    } else {
        pool.push(id);
    }
    sendTask && clearTimeout(sendTask);

    if ((new Date() - lastSend > 1000) || pool.length >= 15) {
        send();
    } else {
        sendTask = setTimeout(send, 1000);
    }
};

