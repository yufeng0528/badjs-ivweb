'use strict';

// 检测plugin文件夹
// 动态加载文件

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('log4js').getLogger();
const pluginPath = path.resolve(__dirname, '../plugin');

const dirs = fs.readdirSync(pluginPath);
logger.info('init plugin ...')

const apiType = ['route'];

// 插件的信息
const list = [];
let plugins = [];
let pluginObj, login = {};

dirs.forEach(item => {

    var pluginObj = require(`${pluginPath}/${item}/index.js`);
    pluginObj.name = item;
    handlePlugin(pluginObj);
})

function handlePlugin(plugin) {
    getRoutePluginInfo(plugin);
    getLoginPluginInfo(plugin);
}

function getRoutePluginInfo(plugin) {
    if (plugin.route) {

        plugin.route.forEach(item => {

            list.push({
                type: 'route',
                path: item.path,
                handle: item.handle
            });

        })

        logger.info(`plugin: ${plugin.name}`);

    }
}

function getLoginPluginInfo(plugin) {
    if (plugin.login) {

        login = plugin.login;
        
    }
}


function getList() {
    return list;
}

// 请求合法行校验
function checkReq (req, res, next) {

   var ffname = req.cookies._ffname,
       md5str = crypto.createHash("md5").update(req.query.applyName + req.query.userName + 'feflow', 'utf8').digest('hex');
   logger.info(`req _ffname: ${ffname}, server md5str: ${md5str}`);
   logger.info(`params: applyName: ${req.query.applyName}, userName: ${req.query.userName}`)
   if (ffname == md5str) {
       next();
   } else {
       logger.info('sign not match');
       res.json({recode: 3, msg: 'ill request.'})
   }
}

// 路由服务调用
function registerRoute(app) {
    app.use('/plugin', checkReq);

    list.forEach(item => {
        if (item.type == 'route') {
            app.use('/plugin/' + item.path, item.handle);
            console.log('plugin registerRoute succ. ')
        }
    })    
}


module.exports = {
   getList,
   login, // 注释表示暂时不使用 oa 验证
   registerRoute
}


