const QQConnect = {};

module.exports = QQConnect;

const request = require('request');
const qs = require('querystring');

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
    const urlQuery = qs.stringify({
        grant_type: 'authorization_code',
        client_id: GLOBAL.pjconfig.QQConnect.APPID,
        client_secret: GLOBAL.pjconfig.QQConnect.APPKey,
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
            return JSON.parse(json).openid || null;
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

