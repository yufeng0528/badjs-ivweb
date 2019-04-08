const a = Date.now();
const IP2Region = require('ip2region');
const query = new IP2Region();
const data = require('./test.json');


const count1 = data.data.reduce((prev, log) => {
    const res = query.search(log.ip);
    if(!res) {
        return prev + 1;
    } else {
        return prev;
    }
}, 0);

console.log(Date.now() - a);
console.log(count1);
console.log(data.data.length);