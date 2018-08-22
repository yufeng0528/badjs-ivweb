
'use strict';
const path = require('path')
const nodemailer = require('nodemailer');
const Promise = require('bluebird')
const log4js = require('log4js');
const logger = log4js.getLogger();
global.pjconfig = require(path.join(__dirname, '../project.json'))

const emailConf = global.pjconfig.email;



// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'qq',  
  auth: {  
    user: emailConf.ivwebMailuser,  
    pass: emailConf.ivwebMailpass
  }  
});

// setup e-mail data with unicode symbols
let mailOptions = {
    from: '"IVWEB" 2580575484@qq.com', // sender address
};

let mailList = [];

module.exports = (from, to, cc, title, content, attachments) => {

    let  _mailOptions = Object.assign({}, mailOptions);

    _mailOptions.to = to;
    _mailOptions.cc = cc;
    _mailOptions.subject = title;
    _mailOptions.html = content;

    if (attachments) {
        _mailOptions.attachments = attachments;
    }

    console.log(`to: ${to}, cc: ${cc}, subject: ${title}`);

    sendMail(_mailOptions).then(info => {
	logger.info(info);
    }).catch(err => {
	logger.error(err);
	// 间隔时间重试
	setTimeout(() => {
            const  cp = require('child_process');
            cp.exec('/data/server/node/node-v4.2.3-linux-x64/bin/node /data/badjs-ivweb/badjs-web/service/ScoreMail.js >> /data/log/scoreMail.log' , (err, out, stderr) => {
                if (err) { logger.error(err) }
                logger.info(out)
                logger.info(stderr)
            })
        }, 10000)
    })
}



function sendMail(maildata) {


  console.log('send email ....')
      console.log(maildata);
  return new Promise((resolve, reject) => {
      // send mail with defined transport object
      transporter.sendMail(maildata, function(error, info){
          if(error){
              console.log(error);
              reject(error)
              
          } else {
            resolve(info)
           logger.info('Message sent: ' + info.response);
          }
      });

  })

}
