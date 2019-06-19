

## 介绍

1. 一站式体系化解决方案：业务只需要简单的配置，引入上报文件，即可实现脚本错误上报，每日统计邮件跟踪方便。
2. 可视化查询系统，快速定位错误信息：web应用程序脚本数量庞大，开发人员在如此之多的脚本中定位某个问题变得困难。BadJS能够巧妙定位错误脚本代码，进行反馈。通过各种查询条件，快速找到详细错误日志。
3. 跨域、Script Error等棘手问题不再是难题：tryjs帮你发现一切。
4. 真实用户体验监控与分析：通过浏览器端真实用户行为与体验数据监控，为您提供JavaScript、AJAX请求错误诊断和页面加载深度分析帮助开发人员深入定位每一个问题细节。 即使没有用户投诉，依然能发现隐蔽bug，主动提升用户体验。<b>ps:没看到这些功能</b>
5. 用户行为分析：细粒度追踪真实的用户行为操作及流程，前端崩溃、加载缓慢及错误问题，可关联到后端进行深度诊断。
6. 产品质量的保障：浏览器百花齐放，用户环境复杂，巨大的差异导致开发人员难以重现用户遇到的问题。 无法像后台一样上报所有用户操作日志。通过BadJS，上报用户端脚本错误，为产品质量保驾护航。

## badjs 快捷安装模块

#### 依赖以下组件：
- node.js
- mongodb 存储上报数据
- mysql 用于web管理系统数据存储，默认账号=root，密码=root，端口3306

在安装前请确保mongodb和mysql已经启动。

## docker 部署
[badjs-docker]( https://hub.docker.com/r/caihuijigood/badjs-docker/) 
``` bash 
// 下载images
docker pull caihuijigood/badjs-docker
// 启动
docker run -i -d -p 80:80 -p 8081:8081 docker.io/caihuijigood/badjs-docker bash badjs mysql=mysql://root:root@192.168.1.101:3306/badjs mongodb=mongodb://192.168.1.101:27017/badjs
```
 
> 其中 mysql 是指定你的mysql 数据库，  mongodburl 是指向你的mongodb,  这个两个参数都是必须的

## Linux | macOS 安装
复制这行代码到命令行执行
```
下载代码后
npm run install
npm run start
```

## 碰到的问题有很多
1. phantomjs cd node-highcharts-exporting-v2/node_modules/phantomjs-prebuilt执行node install.js
2. project.json 缺失，需要手动复制
3. 配置有些没加上，有些没注释掉。
4. 有些代码有问题
5. 数据库sql要执行正确，初始化脚本有问题

## 升级
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/gogoday/track/master/upgrade/upgrade.sh?v=1)"
```

## 配置

### email

进入 badjs-web 目录，修改 project.json
```json
"email": {
    "enable": false,
    "homepage": "http://badjs.com/index.html",
    "from": "noreply-badjs@demo.com",
    "emailSuffix" : "@demo.com",
    "smtp": "smtp.demo.com",
    "smtpUser": "username",
    "smtpPassword": "password",
    "time": "09:00:00",
    "top": 20,
    "module": "email"
}
```
重启 badjs-web 服务

```sh
forever start /data/badjs-ivweb/badjs-web/app.js
```

### crontab

badjs-ivweb 默认使用 linux 中的 crontab 进行定时任务，完成每天邮件的发送功能。

开启定时任务 统计 pv 发送评分日报邮件 编辑定时任务脚本 $crontab -e

添加一下定时任务（请注意更换node路径和文件路径）

```sh
# 统计 pv
6 0 * * * bash /data/badjs-ivweb/badjs-web/service/nginx_log.sh
30 0 * * * bash /data/badjs-ivweb/badjs-web/service/get_pv.sh

# 清理离线日志
30 2 * * * node /data/badjs-ivweb/badjs-web/service/CleanOffline.js >> /data/log/clean.log

# create b_quality table create b_statistics table
0 2 * * * node /data/badjs-ivweb/badjs-web/service/handle-statistics.js >> /data/log/statistics.log
30 3 * * * node /data/badjs-ivweb/badjs-web/service/handle-quality.js >> /data/log/quality.log

# hardware check
0 2 * * * node /data/badjs-ivweb/badjs-web/service/HardwareMail.js

# send score mail
0 4 * * * node /data/badjs-ivweb/badjs-web/service/ScoreMail.js >> /data/log/scoreMail.log

# send top error mail
0 5 * * * node /data/badjs-ivweb/badjs-web/service/TopErrorMail.js >> /data/log/topErrorMail.log

# wechat bot
0 9 * * * node /data/badjs-ivweb/badjs-web/service/WechatService.js >> /data/log/wechatBot.log
```

需要注意的是 `统计 pv` 需要在 `create b_quality table` 前面进行，`pv`，`b_statistics`、`b_quality` 需要在 sendEmail 前进行。


保存后生效
