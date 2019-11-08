const crypto = require('crypto');

var reg = {
    regkey : 'luo-xia-yu-gu-wu-qi-fei'
};

reg.makeKey = function (email) {
    let tmnow = Date.now();
    let h = crypto.createHash('sha256');
    let randnum = parseInt((Math.random() * 100000)) + 1024;
    h.update(`${randnum}${reg.regkey}${email}${randnum}${tmnow}`);
    let hashstr = h.digest('hex');
    
    return {
        hashstr : hashstr,
        randnum : randnum,
        email : email,
        timestamp: tmnow
    };
};

reg.verifyKey = function (obj) {
    if (Date.now() > (obj.timestamp + 1200000) ) {
        return false;
    }

    let h = crypto.createHash('sha256');
    h.update(`${obj.randnum}${reg.regkey}${obj.email}${obj.randnum}${obj.timestamp}`);
    let hashstr = h.digest('hex');

    return (obj.hashstr === hashstr);
};

module.exports = reg;
