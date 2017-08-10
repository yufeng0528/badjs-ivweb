
'use strict';

const http = require('http');
const Promise = require('bluebird');
const api = require(global.apiPath);

// 这里暂时用不到 
function check(req, res, next) {

    if (req.session.user) {
        next();
    } else if (req.query.code) {
        doLogin(req, res, next);
    } else  {

        res.writeHead(302, {
            'Location': 'https://login.oa.tencent.com/Connect/Authorize.ashx?appkey=6f0611791dbc4a59a0f6f17f7bc8783c&redirect_uri=' + encodeURIComponent('http://' + req.headers.host + req.url);
        })
        res.end();
    }



}

function getOAUser(code) {
    return new Promise((resolve, reject) => {

        const url = `https://now.qq.com/zxjg/cgi-bin/tofhander/?type=1&code=${code}`;

        http.get(url, res => {
            const { statusCode } = res;

            if (statusCode !== 200) {
                reject({code: statusCode});
            } else {
                let rawData = '';
                res.on('data', chunk => {
                    rawData += chunk;
                });
                res.on('end', () => {
                    try {
                        const parseData = JSON.parse(rawData);
                        if (parseData.retcode == 0) {
                            resolve(parseData);
                        } else {
                            reject(parseData);
                        }
                    } catch(e) {
                        reject({msg: e});
                    }
                })
            }
            resolve(res);
        }).on('error', e => {
            reject({msg: e});
        })

    })
}

function doLogin(req, res, next) {
    
    var code = req.query.code;

    getOAUser(code).then(data => {
        // 获得用户信息

        return api.getUser(data.LoginName);
    }).then(user => {

        if (user) {
            req.session.user = {
                role : user.role,
                id : user.userId,
                email : user.email,
                loginName : data.loginName ,
                chineseName : data.chineseName
            }

            next();
        } else {
            res.end('用户不存在，请联系系统管理员');
        }
    }).catch(e => {
        res.end('系统异常');
    })
    





}

function logout(req, res, next) {

    res.writeHead(302, {
        'Location': 'https://login.oa.tencent.com/Modules/SignOut.ashx?appkey=6f0611791dbc4a59a0f6f17f7bc8783c&redirect_uri=' + encodeURIComponent('http://' + req.headers.host + req.url);
    })
    res.end();
}



const login = {
    check,
    doLogin,
    logout
}




module.exports = {

    login
}
