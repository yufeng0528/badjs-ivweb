'use strict';

const express = require('express'); 
const router = express.Router(); 
const UserService = require('../../service/UserService'); 

module.exports = router; 

router.get('/users', function(req, res) {
    let verify_state = req.query.verify_state || 0; 
    verify_state = parseInt(verify_state, 10); 

    if (verify_state !== 0 && verify_state !== 1 && verify_state !== 2) {
        return res.json({
            code: 2000, 
            error: 'INVALID_VERIFY_STATE', 
            message: '传参 verify_state 无效'
        }); 
    }

    const userService = new UserService();

    userService.queryUser({
        verify_state
    }, (err, data) => {
        if (err) {
            console.log('SQL Query Error', err); 

            res.json({
                code: 2001,
                error: 'SQL_QUERY_ERROR', 
                message: err
            }); 
        } else {
            res.json({
                code: 0,
                data,
                msg: 'OK'
            }); 
        }
    })
}); 

router.post('/trust_him', function(req, res) {
    const userService = new UserService();
    const loginName = (req.body.loginName || '').trim(); 

    if (!loginName) {
        res.json({
            code: 2000, 
            error: 'INVALID_VERIFY_STATE', 
            message: '传参无效'
        })
    }

    userService.userDao.one({ loginName }, (err, user) => {
        if (err) {
            res.json({
                code: 2002, 
                error: 'SQL_QUERY_ERROR', 
                message: err
            });
        } else if (!user) {
            res.json({
                code: 2003, 
                error: 'USER_NOT_FOUND', 
                message: '没有找到用户'
            }); 
        } else if (user.verify_state !== 1) {
            res.json({
                code: 2004, 
                error: 'USER_UNEXCEPTED', 
                message: '该用户已经绑定openid或未提交绑定', 
                verify_state: user.verify_state
            });
        } else {
            // 设为 2 表示已绑定
            user.verify_state = 2; 
            user.save(err => {
                res.json({
                    code: 0, 
                    message: '审核成功'
                }); 
            });
        }
    });
}); 

