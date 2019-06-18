const cluster = require('cluster');

if (cluster.isMaster) {
    const clusters = [];
    for (let i = 0; i < 4; i++) {
        const forkCluster = cluster.fork();
        console.log('fork', process.pid);
        clusters.push(forkCluster);
    }
}

console.log('aaaaaa');
