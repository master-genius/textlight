'use strict';

process.chdir(__dirname);

const titbit = require('titbit');
const titloader = require('titbit-loader');
const linuxdoc = require('./loaddoc');
const funcs = require('../functions');
const fs = require('fs');
const cluster = require('cluster');
const crypto = require('crypto');
const cfg = require('./config');
const gohttp = require('gohttp');
const theme = require('../theme');
const api = require('../lib/api');

var app = new titbit({
    debug: true,
    showLoadInfo: false,
    maxIPCache: 100000, //缓存最大IP个数
    peerTime: 5, //单位时间5秒
    maxIPRequest: 80, //单位时间内单个IP可以访问50次
    maxConn: 200, //每个进程最大同时支持200个连接
    useLimit: true,
    bodyMaxSize: 1000000,
});

if (cluster.isMaster) {
    fs.watch('./watcher', (evt, name) => {
        if (name === 'stop-server') {
            process.kill(0, 'SIGTERM');
        }
    });
}

if (cluster.isWorker) {
    app.service.api = new api();
    app.service.funcs = funcs;

    var _apikey = {
        token : '',
        key : '',
        createTime: 0,
    };

    var makeApiKey = function () {
        let h = crypto.createHash('md5');
        _apikey.key = `dj_${parseInt(Math.random()*100000)}`;
        h.update(_apikey.key+'linuslinux');
        _apikey.token = h.digest('hex');
        _apikey.createTime = Date.now();
    };
    
    makeApiKey();
    setInterval(() => {
        makeApiKey();
    }, 3600000);

    app.router.get('/apikey', async c => {
        c.res.body = _apikey;
    });
}

if (cluster.isWorker) {
    var ldb = new linuxdoc({
        docpath: cfg.docpath,
        domain:  cfg.apidomain,
        grpLevel: cfg.group
    });

    ldb.init();
    ldb.initLecture();

    var wdb = new linuxdoc({
        docpath: cfg.docpath,
        domain:  cfg.apidomain
    });
    wdb.selfinit(['_read']);

    var ndb = new linuxdoc({
        docpath : cfg.docpath,
        domain : cfg.apidomain
    });
    ndb.selfinit(['_news']);
    ndb.kkeys.sort((a, b) => {
        let ar = a.split('@').filter(p => p.length > 0);
        let br = b.split('@').filter(p => p.length > 0);
        if (ar.length < 2 || br.length < 2) {
            return 0;
        }
        if (ar[1] > br[1]) {
            return -1;
        } else if (ar[1] < br[1]) {
            return 1;
        }
        return 0;
    });

    app.service.docdb = ldb;
    app.service.wdb = wdb;
    app.service.ndb = ndb;
    app.service.docpath = cfg.docpath;
    app.service.imagePath = __dirname + '/image';
    app.service.funcs = funcs;
    app.service.crypto = crypto;
    app.service.hcli = gohttp;
    app.service.domain = cfg.domain;

    var tld = new titloader({
        appPath : __dirname
    });
    tld.init(app);

    app.router.options('/*', async c => {});
}

if (cluster.isWorker) {
    fs.watch('./watcher', (evt, name) => {
        if (name === 'reload-data') {
            ldb.init();
            ldb.initLecture();
        } else if (name === 'restart-server') {
            process.exit(0);
        }
    });
}

if (cluster.isWorker) {

    app.service.siteinfo = cfg.siteinfo;
    try {
        var thm = new theme({
            path : __dirname+'/themes',
            name : cfg.theme,
            siteinfo : cfg.siteinfo,
        });
        thm.load();
        app.service.theme = thm;
    } catch (err){
        console.log(err);
    }

    var _themeStaticCache = {};
    app.router.get('/theme/*', async c => {
        var encoding = 'utf8';
        if (c.param.starPath.indexOf('.css') > 0) {
            c.setHeader('content-type', 'text/css; charset=utf-8');
        } else if (c.param.starPath.indexOf('.js') > 0) {
            c.setHeader('content-type', 'text/javascript; charset=utf-8');
        } else if (c.param.starPath.indexOf('.jpg') > 0) {
            encoding = 'binary';
            c.setHeader('content-type', 'image/jpeg');
        } else if (c.param.starPath.indexOf('.png') > 0) {
            encoding = 'binary';
            c.setHeader('content-type', 'image/png');
        }
        if (_themeStaticCache[c.param.starPath] !== undefined) {
            c.res.encoding = encoding;
            c.setHeader('cache-control', 'public,max-age=86400');
            c.res.body = _themeStaticCache[c.param.starPath];
            return ;
        }
        try {
            c.setHeader('cache-control', 'public,max-age=86400');
            c.res.encoding = encoding;
            c.res.body = await funcs.readFile(
                `./themes/${c.service.siteinfo.theme}/${c.param.starPath}`, encoding);
            _themeStaticCache[c.param.starPath] = c.res.body;
        } catch (err) {
            console.log(err);
            c.status(404);
        }
    }, '@page-static');

    var faviconCache = null;
    app.router.get('/favicon.ico', async c => {
        try {
            c.setHeader('content-type', 'image/x-icon');
            c.res.encoding = 'binary';
            if (faviconCache && (faviconCache.time + 300000) > Date.now()) {
                c.res.body = faviconCache.data;
                c.setHeader('content-length', faviconCache.length);
            } else {
                c.res.body = await funcs.readFile('./favicon.ico', 'binary');
                faviconCache = {
                data : c.res.body,
                length: c.res.body.length,
                time: Date.now()
                };
            }
        } catch (err) {
        c.res.body = '';
        }
    });

    //在此之前已经把所有的路由都加载完毕，否则如果是/:name则会影响其他路由的查找。
    app.get('/:name', async c => {
        try {
            c.res.body = c.service.theme.find(c.param.name);
            c.setHeader('cache-control', 'public,max-age=86400');
            if (c.res.body === null) {
                c.res.body = c.service.theme.find('404');
                c.status(404);
            }
        } catch (err) {
            c.status (404);
        }
    }, '@page-static');
    app.get('/', async c => {
        c.res.body = c.service.theme.find('home');
    }, '@page-static');
}

if (process.argv.indexOf('-d') > 0) {
    app.config.daemon = true;
    app.config.showLoadInfo = true;
}

var host = 'localhost';
if (process.argv.indexOf('-h0') > 0) {
    host = '0.0.0.0';
}

if (process.argv.indexOf('--no-limit') > 0) {
    app.config.useLimit = false;
}

app.daemon(cfg.port, host, 2);
