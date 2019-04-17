'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QQConnect = require('../../lib/QQConnect');
const qs = require('querystring');
const UserService = require('../../service/UserService');

module.exports = router;

router.post('/login', function (req, res) {
    const userDao = req.models.userDao;

    userDao.one({ loginName: req.body.username }, (err, user) => {
        if (err || !user || (crypto.createHash("md5").update(req.body.password).digest('hex') != user.password)) {
            res.json({
                code: 1100,
                error: 'LOGIN_ERR',
                message: '登陆失败，请检查账号密码'
            });
        } else {
            req.session.user = {
                role: user.role,
                id: user.id,
                email: user.email,
                loginName: user.loginName,
                chineseName: user.chineseName,
                verify_state: parseInt(user.verify_state, 10),
                openid: user.openid
            };

            res.json({
                code: 0,
                message: '登陆成功'
            });
        }
    });
});

router.get('/update_session', function (req, res) {
    const userDao = req.models.userDao;
    const loginName = req.session.user.loginName;

    if (!loginName) return res.json({
        code: -1, message: '请登录'
    });

    // console.log('UserInfo Upadte Session', req.session);

    userDao.one({ loginName }, (err, user) => {
        if (!user) return res.json({
            code: 1100,
            error: 'LOGIN_ERR',
            message: '登陆失败，请检查账号'
        });

        req.session.user = {
            role: user.role,
            id: user.id,
            email: user.email,
            loginName: user.loginName,
            chineseName: user.chineseName,
            verify_state: parseInt(user.verify_state, 10),
            openid: user.openid
        };

        meAction(req, res);
    });
});

/**
 * 绑定并注册
 */
router.post('/bind-openid', function (req, res) {
    const userDao = req.models.userDao;
    const loginName = (req.body.loginName || '').trim();
    const openid = (req.body.openid || '').trim();

    if (!/^[A-Za-z]{1,20}$/.test(loginName)) {
        return res.json({
            code: 1005,
            error: 'INVALID_LOGINNAME',
            message: '大佬别玩了'
        });
    }

    if (!loginName || !openid || loginName.length > 20) {
        return res.json({
            code: 1005,
            error: 'INVALID_LOGINNAME',
            message: '参数错误'
        });
    }

    userDao.one({ loginName }, (err, user) => {
        if (err) {
            res.json({
                code: 1002,
                error: 'QUERY_USER_SQL_ERR',
                message: '系统错误，请联系管理员'
            });
        } else if (user) {
            if (user.openid) {
                return res.json({
                    code: 1006,
                    error: 'OPENID_OCCUPY',
                    message: '该 RTX 已被绑定，如有疑问请联系管理员'
                });
            }

            // 用户已存在，绑定之
            user.openid = openid;
            user.verify_state = 1;
            user.save(err => {
                if (err) {
                    res.json({ code: 1002, error: 'QUERY_USER_SQL_ERR' });
                } else {
                    req.session.user = {
                        role: user.role,
                        id: user.id,
                        email: user.email,
                        loginName: user.loginName,
                        chineseName: user.chineseName,
                        verify_state: parseInt(user.verify_state, 10),
                        openid: user.openid
                    };
                    meAction(req, res);
                }
            });
        } else {
            userDao.create({
                chineseName: loginName,
                role: 0,
                // 下面这 3 个参数很重要
                loginName,
                openid,
                verify_state: 1
            }, (err, user) => {
                if (err) {
                    console.error(err);
                    res.json({
                        code: 1004,
                        error: 'INSERT_USER_SQL_ERR',
                        message: '系统错误，请联系管理员' + err
                    });
                } else {
                    req.session.user = {
                        role: user.role,
                        id: user.id,
                        email: user.email,
                        loginName: user.loginName,
                        chineseName: user.chineseName,
                        verify_state: parseInt(user.verify_state, 10),
                        openid: user.openid
                    };
                    meAction(req, res);
                }
            });
        }
    });
});

/**
 * 用 code 登陆
 */
router.post('/login-by-code', function (req, res) {
    const userDao = req.models.userDao;

    QQConnect.code2openid(
        req.body.code || '', req.body.redirect_uri || ''
    ).then(openid => {
        if (!openid) {
            return res.json({
                code: 500,
                error: 'OPENID_REQUEST_ERROR',
                message: 'openid 请求失败，请重试'
            });
        }
        userDao.one({ openid }, (err, user) => {
            if (err) {
                res.json({
                    code: 500,
                    error: 'SQL_QUERY_ERROR',
                    message: '查询失败，请重试'
                });
            } else if (!user) {
                // 此步说明数据库中不存在这个 openid 须进一步创建
                res.json({
                    code: 0,
                    data: { openid },
                    message: '请使用此值进行 openid 绑定'
                });
            } else {
                QQConnect.getUserInfoByOpenid().then((user_info) => {
                    try {
                        if (user_info) {
                            user_info = JSON.parse(user_info);
                        } else {
                            user_info = {
                                figureurl_qq_2: ''
                            };
                        }
                    } catch (e) {

                    }

                    req.session.user = {
                        role: user.role,
                        id: user.id,
                        email: user.email,
                        loginName: user.loginName,
                        chineseName: user.chineseName,
                        avatar: user_info.figureurl_qq_2 || '',
                        verify_state: parseInt(user.verify_state, 10),
                        openid: user.openid
                    };

                    // 说明有了，获取登陆态
                    meAction(req, res);
                });
            }
        });
    }).catch(error => {
        res.json({
            code: 500, error,
            message: '请求失败'
        });
    });
});

/**
 * 获取个人资料
 */
function meAction (req, res) {
    if (!req.session.user) {
        res.json({
            code: -1,
            message: '请登录',
            data: null
        });
    } else {
        res.json({
            code: 0,
            data: {
                loginName: req.session.user.loginName,
                role: req.session.user.role,
                email: req.session.user.email,
                avatar: req.session.user.avatar,
                chineseName: req.session.user.chineseName,
                verify_state: parseInt(req.session.user.verify_state, 10)
            }
        });
    }
}

router.get('/me', meAction);

