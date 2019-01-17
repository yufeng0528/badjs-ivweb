'use strict';

const express = require('express'); 
const router = express.Router(); 
// const qs = require('querystring'); 
// const request = require('request'); 
// const UserAction = require('../action/UserAction'); 

module.exports = router; 

const UsersRouter = require('./users'); 
const UserVerifyRouter = require('./user_verify');

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://guardjs.badjs2.ivweb.io");
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    

    if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
        next(); 
    }
})

router.get('/', (req, res) => {
    res.json('hello ^ ^'); 
}); 

// 错误码: 1xxx
router.use('/users', UsersRouter); 

router.use((req, res, next) => {
    const isAdmin  = req.session && req.session.user && req.session.user.role == 1;

    if (isAdmin) {
        next(); 
    } else {
        // 非管理员
        res.json({
            code: -2,
            msg: "请登录管理员账号"
        });
    }
});

// 错误码: 2xxx
router.use('/verify', UserVerifyRouter)

