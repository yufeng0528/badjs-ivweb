const log4js = require('log4js');
const logger = log4js.getLogger();
const request = require('request-promise-native');

const HOOK_URL = 'http://in.qyapi.weixin.qq.com/cgi-bin/webhook/send';

/**
 * 微信机器人推送消息工具方法
 * @param {string} params.robotKey - 机器人 key
 * @param {string} [params.messageType=markdown] - 消息类型：markdown、text
 * @param {string} params.message - 消息内容
 * @param {string} [params.mentionText=请相关同事注意。] - @ 提示文本
 * @param {string[]} [params.mentionedList=[]] - @ 企业微信账号列表，单独用一条 text 格式的消息发送
 * @returns {Promise}
 */
async function wechatNotify ({
                                 robotKey,
                                 messageType = 'markdown',
                                 message,
                                 mentionText = '请相关同事注意。',
                                 mentionedList = [],
                             }) {
    const baseOptions = {
        method: 'POST',
        uri: `${HOOK_URL}?key=${robotKey}`,
        json: true, // Automatically stringifies the body to JSON
    };

    // request body of markdown and text
    const bodys = {
        markdown: {
            msgtype: 'markdown',
            markdown: {
                content: message,
            },
        },
        text: {
            msgtype: 'text',
            text: {
                content: message,
            },
        },
    };

    // message
    await request({
        ...baseOptions,
        body: {
            ...bodys[messageType]
        }
    });

    // mention
    if (mentionedList.length > 0) {
        const mentionOption = {
            ...baseOptions,
            body: {
                ...bodys.text,
            },
        };
        mentionOption.body.text.content = mentionText;
        mentionOption.body.text.mentioned_list = mentionedList;
        await request(mentionOption);
    }
}

/**
 * 企业微信机器人：项目上报数量异常告警
 * @param {number} projectID - 项目 ID
 * @param {number} quantityLimit - 1小时上报总量阈值
 * @param {boolean} isHalfNotify - 是否达到阈值一半时的提示
 * @returns {Promise}
 */
async function quantityLimitNotify (projectID, quantityLimit, isHalfNotify) {
    const robotKey = global.pjconfig.wechat.robotKey;
    const mentionedList = [];
    // find project info
    const project = global.projectsInfo[projectID] || {};
    const { user: owner, name = '' } = project;

    if (owner) {
        mentionedList.push(owner);
    }

    const halfText = quantityLimit / 2 / 10000 + 'w';
    const totalText = quantityLimit / 10000 + 'w';

    const message =
        (isHalfNotify
            ? `#### Aegis 1小时内项目上报数量超过${halfText}条异常提示\n\n`
            : `#### Aegis 1小时内项目上报数量超过${totalText}条丢弃告警\n\n`) +
        `> ${projectID} - ${name}\n` +
        `\n（限制策略：1小时内，上报超过${halfText}条将提示异常，超过${totalText}条将丢弃上报并告警。每隔1小时重置记录）` +
        '\n进入 [Aegis](https://aegis.ivweb.io) 定位问题。';

    return wechatNotify({
        robotKey,
        message,
        mentionedList,
    })
}

module.exports = {
    quantityLimitNotify,
    wechatNotify,
}
