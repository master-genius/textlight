const funcs = require('../functions');

/**
 * 一些关键数据需要加密，而通用的数据则需要公开，比如用户昵称，头像等
 */

exports.userToken = function (userinfo, key, iv = '1234567890123456') {
    let tm = Date.now();
    let mkey = (`${tm}${key}`).substring(0, 32);
    //如果没有设置expires则默认为1小时
    if (userinfo.expires === undefined) {
        userinfo.expires = 3600000;
    }
    if (userinfo.timestamp === undefined) {
        userinfo.timestamp = tm;
    }

    let edata = funcs.aesEncrypt(JSON.stringify(userinfo), mkey, iv);

    return `${tm}$${encodeURIComponent(edata)}`;
};

exports.verifyToken = function (edata, key, iv = '1234567890123456') {
    try {
        let p = edata.split('$');
        let u = funcs.aesDecrypt(p[1], (`${p[0]}${key}`).substring(0,32), iv);
        let uj = JSON.parse(u);
        if (uj.timestamp + uj.expires < Date.now()) {
            return false;
        }
        return uj;
    } catch (err) {
        return false;
    }
};

exports.verifyTokenNoTime = function (edata, key, iv = '1234567890123456') {
    try {
        let p = edata.split('$');
        let u = funcs.aesDecrypt(p[1], (`${p[0]}${key}`).substring(0,32), iv);
        let uj = JSON.parse(u);
        return uj;
    } catch (err) {
        return false;
    }
};
