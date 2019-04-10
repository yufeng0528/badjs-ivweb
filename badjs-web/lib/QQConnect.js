const QQConnect = {};

module.exports = QQConnect;

const request = require('request');
const qs = require('querystring');

let g_access_token = ''
let g_openid = ''

const httpGet = url => new Promise((res, rej) => {
    console.log('load', url);
    request(url, (err, response, body) => {
        if (err) {
            rej(err);
        } else {
            console.log('success', body);
            res(body);
        }
    });
});

QQConnect.code2accessToken = function (code, redirect_uri) {
    console.info(global.pjconfig.QQConnect);
    const urlQuery = qs.stringify({
        grant_type: 'authorization_code',
        client_id: global.pjconfig.QQConnect.APPID,
        client_secret: global.pjconfig.QQConnect.APPKey,
        code: code || '',
        redirect_uri: redirect_uri || ''
    });

    const fullUrl = `https://graph.qq.com/oauth2.0/token?${ urlQuery }`;

    return httpGet(fullUrl).then(res => {
        return res.split('&').reduce((acc, e) => {
            const t = e.split('=');
            const k = t[0];
            const v = t[1];
            acc[k] = decodeURIComponent(v);
            return acc;
        }, {}).access_token || null;
    });
};

QQConnect.accessToken2openid = function (accessToken) {
    // 因为 callback 的缘故，要多包一层
    return httpGet(`https://graph.qq.com/oauth2.0/me?access_token=${ accessToken }`).then(jsonp => {
        const l = jsonp.indexOf('{');
        const r = jsonp.lastIndexOf('}');
        const json = jsonp.substring(l, r + 1);

        try {
            const openid = JSON.parse(json).openid || null;
            g_access_token = accessToken;
            g_openid = openid;
            return openid;
        } catch (err) {
            return null;
        }
    });
};

QQConnect.code2openid = function (code, redirect_uri) {
    return this.code2accessToken(
        code, redirect_uri
    ).then(accessToken => {
        if (accessToken) {
            return this.accessToken2openid(accessToken);
        } else {
            return null;
        }
    });
};

QQConnect.getUserInfoByOpenid = function () {
    console.info(`g_access_token: ${g_access_token}; g_openid: ${g_openid}`);
    if (!g_access_token || !g_openid) {
        return null;
    }
    const urlQuery = qs.stringify({
        access_token: g_access_token,
        oauth_consumer_key: global.pjconfig.QQConnect.APPID,
        openid: g_openid
    });

    const fullUrl = `https://graph.qq.com/user/get_user_info?${ urlQuery }`;

    return httpGet(fullUrl).then(res => {
        return res || null;
    }).catch((err) => {
        console.info(err);
    });
};