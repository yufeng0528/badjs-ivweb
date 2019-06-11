const monitor = require('./index.js');

// monitor(34464214);
let count = 0;

const inter = setInterval(() => {
    if (++count === 500) {
        clearInterval(inter);
    }
    monitor(34464214);
}, 200);
