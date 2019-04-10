
global.pjconfig = require('../project.debug.json');

const crypto = require('crypto');

const hmac = crypto.createHmac('sha256', global.pjconfig.secretKey);

const hmac1 = crypto.createHmac('sha256', global.pjconfig.secretKey);

// hmac.update('Hello, world!');
hmac.update('Hello, node!');
hmac1.update('Hello, node!');

console.log(hmac.digest('hex'));
console.log(hmac1.digest('hex'));
