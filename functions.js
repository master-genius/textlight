'use strict';

const fs = require('fs');
const crypto = require('crypto');

exports.readFile = function (filename, encoding = 'utf8') {
    return new Promise((rv, rj) => {
        fs.readFile(filename, {encoding:encoding}, (err, data) => {
            if (err) {
                rj(err);
            } else {
                rv(data);
            }
        });
    });
};

exports.writeFile = function (filename, data, encoding = 'utf8') {
    return new Promise((rv, rj) => {
        fs.writeFile(filename, data, {encoding: encoding}, err => {
            if (err) {
                rj(err);
            } else {
                rv(true);
            }
        });
    });
};

exports.getContentType = function (extname) {
    switch (extname.toLowerCase()) {
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';

        default: return '';
    }
};

exports.aesEncrypt = function (data, key, iv='1234567890123456', options = {}) {
    var h = crypto.createCipheriv('aes-256-cbc', key, iv, options);
    let hd = h.update(data, 'utf8', 'hex');
    hd += h.final('hex');
    return hd;
};

exports.aesDecrypt = function (data, key, iv='1234567890123456', options = {}) {
    var h = crypto.createDecipheriv('aes-256-cbc', key, iv, options);
    let hd = h.update(data, 'hex', 'utf8');
    hd += h.final('utf8');
    return hd;
};

exports.whirlpool = function(data) {
    var h = crypto.createHash('whirlpool');
    h.update(data);
    return h.digest('hex');
};

exports.md5 = function (data) {
    var h = crypto.createHash('md5');
    h.update(data);
    return h.digest('hex');
};

exports.sha1 = function (data) {
    var h = crypto.createHash('sha1');
    h.update(data);
    return h.digest('hex');
};

exports.sha512 = function (data) {
    var h = crypto.createHash('sha512');
    h.update(data);
    return h.digest('hex');
};

exports.makeSalt = function (length = 8) {
    var saltArr = [
        'a','b','c','d','e','f','g',
        'h','i','j','k','l','m','n',
        'o','p','q','r','s','t','u',
        'v','w','x','y','z','1','2',
        '3','4','5','6','7','8','9'
    ];

    let total = saltArr.length;
    let saltstr = '';
    let ind = 0;

    for(let i=0; i<length; i++) {
        ind = parseInt( Math.random() * 10000) % total;
        saltstr += saltArr[ ind ];
    }
    return saltstr;
};

exports.formatTime = function (t = null, fmt = 'long') {
    if (t == null) {
        t = new Date();
    }
    if (fmt == 'short') {
        return `${t.getFullYear()}-${t.getMonth()+1}-${t.getDate()}`;
    } else if (fmt == 'middle') {
        return `${t.getFullYear()}-${t.getMonth()+1}-${t.getDate()} ${t.getHours()}:${t.getMinutes()}`;
    }
    
    return `${t.getFullYear()}-${t.getMonth()+1}-${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
};

exports.timestr = function () {
  let t = new Date();
  let year = t.getFullYear();
  let month = t.getMonth()+1;
  let day = t.getDate();
  let hour = t.getHours();
  let min = t.getMinutes();
  let sec = t.getSeconds();

  return `${year}-${month > 9 ? '' : '0'}${month}-${day > 9 ? '' : '0'}${day}_${hour > 9 ? '' : '0'}${hour}-${min > 9 ? '' : '0'}${min}-${sec > 9 ? '' : '0'}${sec}`;
};
