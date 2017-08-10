
'use strict';

const http = require('http');
const Promise = require('bluebird');
const api = require(global.apiPath);

function check(req, res, next) {

    if (req.session.user) {
        next();
    } else if (req.query.code) {
        console.log('oalogin dologin.')
        doLogin(req, res, next);
    } else  {
        console.log('oalogin not login.')

        redirect(req, res, 'https://login.oa.tencent.com/Connect/Authorize.ashx');

    }



}

function getOAUser(code) {
    return new Promise((resolve, reject) => {

        const url = `http://now.qq.com/zxjg/cgi-bin/tofhander/?type=1&code=${code}`;

        http.get(url, res => {
            const statusCode = res.statusCode;

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
        }).on('error', e => {
            reject({msg: e});
        })

    })
}

function doLogin(req, res, next) {
    
    var code = req.query.code;

    getOAUser(code).then(data => {
        // 获得用户信息

        return api.getUser(data.data.LoginName);
    }).then(user => {

        if (user) {
            req.session.user = {
                role : user.role,
                id : user.userId,
                email : user.email,
                loginName : user.name,
                chineseName : user.name
            }

            next();
        } else {
            res.end('用户不存在，请联系系统管理员');
        }
    }).catch(e => {
        if (e.retcode == 5) {

            redirect(req, res, 'https://login.oa.tencent.com/Connect/Authorize.ashx')

        } else {
            res.end(JSON.stringify(e));
        }
    })
    





}

function logout(req, res, next) {
    req.session.user = null;
    redirect(req, res, 'https://login.oa.tencent.com/Modules/SignOut.ashx');
}


function redirect(req, res, url) {
    res.writeHead(302, {
        'Location': url + '?appkey=6f0611791dbc4a59a0f6f17f7bc8783c&redirect_uri=' + encodeURIComponent('http://' + req.headers.host + '/user/index.html');
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
