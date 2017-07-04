
'use strict';
const nodemailer = require('nodemailer');
const Promise = require('bluebird')
const log4js = require('log4js');
const logger = log4js.getLogger();



// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'qq',  
  auth: {  
    user: '2580575484@qq.com',  
    pass: 'jyqujqyyunkydjhb' 
  }  
});

// setup e-mail data with unicode symbols
let mailOptions = {
    from: '"IVWEB" 2580575484@qq.com', // sender address
};


module.exports = (from, to, cc, title, content, attachments) => {

  mailOptions.to = to;
  mailOptions.cc = cc;
  mailOptions.subject = title;
  mailOptions.html = content;

  if (attachments) {
      mailOptions.attachments = attachments;
  }
  
mailOptions.to = 'sampsonwang@tencent.com';

console.log(mailOptions);
  return new Promise((resolve, reject) => {

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
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
