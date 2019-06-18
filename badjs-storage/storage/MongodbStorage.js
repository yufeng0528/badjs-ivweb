const MongoClient = require('mongodb').MongoClient;
const http = require('http');
const map = require('map-stream');

const log4js = require('log4js');
const logger = log4js.getLogger();
const monitor = require('../service/monitor');

const realTotal = require('../service/realTotalMaster');

let mongoDB, adminMongoDB;


const hadCreatedCollection = {};

const tryInit = function (db, collectionName, cb) {
    if (hadCreatedCollection[collectionName] === 'ping') {
        return;
    }
    if (hadCreatedCollection[collectionName] === true) {
        const collection = db.collection(collectionName);
        cb(null, collection);
        return true;
    }

    hadCreatedCollection[collectionName] = 'ping';
    db.createCollection(collectionName, { capped: true, size: 1000000, max: 5000 }, function (err, collection) {
        console.log('创建 collection 成功: ', collectionName);
        collection.indexExists('date_-1_level_1', function (errForIE, result) {
            if (errForIE) {
                throw errForIE;
            }
            if (!result) {
                collection.createIndex({ date: -1, level: 1 }, function (errForCI) {
                    if (errForCI) {
                        throw errForCI;
                    }
                    console.log(collectionName + '创建索引 date_-1_level_1 成功');
                    if (global.MONGODB.isShard) {
                        adminMongoDB.command({
                            shardcollection: 'badjs.' + collectionName,
                            key: { _id: 'hashed' }
                        }, function (errForShard, info) {
                            if (errForShard) {
                                throw errForShard;
                            } else {
                                logger.info(collectionName + ' shard correctly');
                                cb(null, collection);
                                hadCreatedCollection[collectionName] = true;

                            }
                        });
                    } else {
                        cb(null, collection);
                        hadCreatedCollection[collectionName] = true;
                    }

                });
            } else {
                cb(null, collection);
                hadCreatedCollection[collectionName] = true;
            }
        });
    });
};

const hadCreatedUINCollection = {};

const createUinIndex = function (collection, collectionName, cb) {
    if (hadCreatedUINCollection[collectionName] === 'ping') {
        return;
    }
    if (hadCreatedUINCollection[collectionName] === true) {
        cb(null, collection);
        return true;
    }

    hadCreatedUINCollection[collectionName] = 'ping';
    collection.indexExists('uin_1', function (errForIE, result) {
        if (errForIE) {
            throw errForIE;
        }
        if (!result) {
            collection.createIndex({ uin: 1 }, function (errForCI) {
                console.log(collectionName + '创建索引 uin 成功');
                if (errForCI) {
                    throw errForCI;
                }
                hadCreatedUINCollection[collectionName] = true;
                cb(null, collection);

            });
        } else {
            hadCreatedUINCollection[collectionName] = true;
            cb(null, collection);
        }
    });
};


const insertDocuments = function (db, model) {
    const collectionName = 'badjslog_' + model.id;

    tryInit(db, collectionName, function (err, collection) {
        createUinIndex(collection, collectionName, function (error, coll) {
            coll.insert([
                model.model
            ], function (err, result) {
                if (err) {
                    monitor(34471884); // [ivweb-aegis] mongodb插入失败
                    console.log('badjs-storage insert documents err', err);
                    errorNum++;
                } else {
                    count++;
                }
            });
        });
    });
};


MongoClient.connect(global.MONGODB.url, function (err, db) {
    if (err) {
        logger.error('failed connect to mongodb');
    } else {
        logger.info('Connected correctly to mongodb');
    }
    mongoDB = db.db('badjs');
});


if (global.MONGODB.isShard) {
    MongoClient.connect(global.MONGODB.adminUrl, function (err, db) {
        if (err) {
            logger.error('failed connect to mongodb use admin admin');
        } else {
            logger.info('Connected  correctly to mongodb use admin');
        }
        adminMongoDB = db;
    });
}


module.exports = function () {
    return map(function (data) {
        const dataStr = data.toString();
        try {
            data = JSON.parse(dataStr.substring(dataStr.indexOf(' ')));
        } catch (e) {
            logger.error('parse error');
            return;
        }

        if (data.level != 4 && data.level != 2) {
            return;
        }

        if (!data.id) {
            logger.info('not id data');
            return;
        }

        if (!mongoDB) {
            dataStr.substring(dataStr.indexOf(' '));
            logger.info('cannot connect mongodb');
            return;
        }
        const id = data.id;
        delete data.id;

        let all = '';
        for (const key in data) {
            all += ';' + key + '=' + data[key];
        }
        data.all = all;

        insertDocuments(mongoDB, {
            id: id,
            model: data
        });

        if (data.level == 4) {
            realTotal.increase(id, data);
        }

    });
};

let count = 0, errorNum = 0;
http.createServer((req, res) => {
    res.end(`${count},${errorNum}`);
    count = 0;
    errorNum = 0;
}).listen(2002, () => {
    console.log('report server listen at 2002.');
});

