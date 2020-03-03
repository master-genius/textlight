/**
 * TextLight 内容发布系统，保持开源和简洁。发布于GPL协议。
 * 由雄县道简网络科技开发(https://www.w3xm.cn)。
 * 目前一些Web工具都是我个人开发的，也有一些辅助人员。
 * version: 1.3.2
 */
'use strict';

process.chdir(__dirname);

const titbit = require('titbit');
const cluster = require('cluster');
const tbload = require('titbit-loader');
const pg = require('pg');
const cfg = require('./config/config');
const dbcfg = require('./config/dbconfig');
const docs = require('./model/docs');
const admin = require('./model/admin');
const siteinfo = require('./model/siteinfo');
const usertoken = require('./lib/user');
const api = require('./lib/api');
const page = require('./apage');
const fs = require('fs');
const cms = require('./lib/cms');
const funcs = require('./functions');
const theme = require('./theme');

var app = new titbit ({
  debug : true,
  bodyMaxSize: 5000000,
  useLimit: true,
  maxConn : 300,
  maxIPCache: 100000,
  maxIPRequest: 80,
  peerTime: 1,
  loadInfoFile : '/tmp/loadinfo.log'
});

//set options
var options = {
  debug : 'boolean',
  bodyMaxSize : 'number',
  useLimit: 'boolean',
  maxConn : 'number',
  maxIPCache: 'number',
  peerTime: 'number',
};

for (let k in options) {
  if (cfg[k] !== undefined && typeof cfg[k] === options[k]) {
    app.config[k] = cfg[k];
  }
}
//end options

//conn
app.on('connection', (sock) => {
  app.rundata.conn += 1;
  sock.on('close', () => {
    app.rundata.conn -= 1;
  });
});

try {
  fs.accessSync('servnotify', fs.constants.F_OK);
} catch (err) {
  fs.mkdirSync('servnotify');
}

var _imagepath = __dirname + '/website/image';

if (cluster.isMaster) {
  fs.watch('./servnotify', (evt, name) => {
    if (name === 'stop-server') {
      process.kill(0, 'SIGTERM');
    }
  });
  try {
    fs.accessSync(_imagepath, fs.constants.F_OK);
  } catch (err) {
    fs.mkdirSync(_imagepath);
  }
}

if (cluster.isWorker) {
  var _pgdb = new pg.Pool(dbcfg);
  app.service.pool = _pgdb;

  app.service.admin = new admin(_pgdb);

  app.service.docs = new docs(_pgdb);
  app.service.api = new api();
  app.service.adminkey = cfg.adminkey;
  app.service.user = usertoken;

  app.service.imagepath = _imagepath;
  app.service.funcs = funcs;

  app.service.siteimgpath = __dirname + '/images';
  app.service.sitedata = __dirname + '/website';
  app.service.alog = {};
  app.service.cors = cfg.cors;
  app.service.expires = cfg.expires * 1000;

  app.service.sitestatus = cfg.status;

  app.service.usePassCallback = false;
  app.service.permsource = '';
  try {
    if (cfg.usePassCallback && typeof cfg.passCallback === 'function') {
      app.service.usePassCallback = cfg.usePassCallback;
      app.service.passCallback = cfg.passCallback;
      app.service.permsource = cfg.permsource;
    }
  } catch (err) {}
  
}

var _themeStaticCache = {};

if (cluster.isWorker) {
  let tb = new tbload({
    loadModel: false,
  });
  tb.init(app);
  //如果存在dev则加载用户开发的模块
  try {
    fs.accessSync('./dev', fs.constants.F_OK);
    let tbdev = new tbload({
      loadModel: true,
      appPath: './dev',
      mdb : _pgdb,
      pre : '@dev'
    });
    tbdev.init(app);
    //console.log(app.router.routeTable());
    //console.log(app.router.apiGroup);
  } catch (err) {
    //console.log(err);
  }

  app.service.siteinfo = new siteinfo({
    path : __dirname + '/website/siteinfo',
    watchFile : __dirname + '/servnotify/reload-siteinfo',
    watchTheme :  __dirname + '/servnotify/change-theme',
    themedir : __dirname + '/themes'
  });
  app.service.siteinfo.init();
  var adminpage = new page({
    path : __dirname + '/adminpages',
    title : app.service.siteinfo.info.title,
    sitename : app.service.siteinfo.info.sitename,
    topinfo: app.service.siteinfo.info.sitename+'管理后台',
    footer : cms.footer,
    menu : cms.menu,
    initjs : `var _apidomain=location.protocol + '//' + location.host;`
              +`var _adminapi='${cfg.adminapi}';\n`,
  });

  var admpagelist = ['home','login','admin','site','docs', 'image'];
  app.service.adminpage = adminpage;
  adminpage.init(admpagelist);
  adminpage.page40x();

  app.service.theme = new theme({
    path : __dirname + '/' + cfg.themePath,
    name : app.service.siteinfo.info.theme,
    siteinfo : app.service.siteinfo.info,
  });

  try {
    app.service.theme.load();
  } catch (err) {
    console.log(err);
  }

  fs.watch('./servnotify', (evt, name) => {
    if (name === 'reload-siteinfo') {
      app.service.siteinfo.reload();
      adminpage.setinfo({
        title : app.service.siteinfo.info.title,
        sitename : app.service.siteinfo.info.sitename,
        topinfo: app.service.siteinfo.info.sitename+'管理后台',
      });
      adminpage.init(admpagelist);
      adminpage.page40x();
      setTimeout(() => {
        app.service.theme.reload(app.service.siteinfo.info);
      }, 1000);
    } else if (name === 'change-theme') {
      _themeStaticCache = {};
      app.service.theme.setTheme(app.service.siteinfo.info.theme);
    } else if (name === 'restart-server') {
      process.exit(0);
    }
  });

}

if (cluster.isWorker) {
  app.get('/adminpage/:name', async c => {
    try {
      c.res.body = adminpage.find(c.param.name);
      if (c.res.body === null) {
        c.res.body = adminpage.find('404');
        c.status(404);
      }
    } catch (err) {
      c.status (404);
    }
  }, '@admin-page');

  app.get('/', async c => {
    c.res.body = c.service.theme.find('home');
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

  var _staticCache = {};
  var loadStatic = async function (stname) {
      if (_staticCache[stname]) {
          return _staticCache[stname];
      }
      let stdata = await funcs.readFile('./static/'+stname);
      _staticCache[stname] = stdata;
      return _staticCache[stname];
  }

  app.router.get('/static/*', async c => {
    if (c.param.starPath.indexOf('.css') > 0) {
        c.setHeader('content-type', 'text/css; charset=utf-8');
    } else if (c.param.starPath.indexOf('.js') > 0) {
        c.setHeader('content-type', 'text/javascript; charset=utf-8');
    }
    try {
        c.res.body = await loadStatic(c.param.starPath);
        c.setHeader('cache-control', 'public,max-age=86400');
    } catch (err) {
        c.status(404);
    }
  }, '@static-source');

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
          `${c.service.theme.path}/${c.service.siteinfo.info.theme}/${c.param.starPath}`, encoding);
      _themeStaticCache[c.param.starPath] = c.res.body;
    } catch (err) {
      console.log(err);
      c.status(404);
    }
  }, '@page-static');

  //如果你要去掉page，也是可以的，但是要保证此路由放在最后，也就是当前位置，
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
}

if (cluster.isWorker) {
  //启用IP白名单中间件
  if (cfg.allowList.length > 0) {
    app.service.allowList = cfg.allowList;
    let alip = require('./middleware/allowlist');
    app.use(alip, {
      group : '/admin'
    });
    app.use(alip, {
      group: 'admin-page'
    });
  }

  if (cfg.useDownload) {
    try {
      let download = require('./middleware/download');
      let dw = new download({
        max : cfg.downloadMax,
        path : cfg.downloadPath
      });
      app.router.get('/download/*', async c => {}, '@download');
      app.use(dw.middleware.bind(dw), {
        group: 'download'
      });
    } catch (err) {
      console.log(err);
    }
  }

  if (cfg.logger) {
    try {
      let logger = require('./middleware/log');
      let lgg = new logger({
        routes: cfg.loggerRoutes,
        cache : cfg.loggerCacheCount
      });
      app.use(lgg.middleware.bind(lgg));
    } catch (err){
      console.log(err);
    }
  }
}

if (process.argv.indexOf('-d') > 0) {
  app.config.daemon = true;
  app.config.showLoadInfo = true;
}

if (process.argv.indexOf('--no-limit') > 0) {
  app.config.useLimit = false;
}

app.daemon(cfg.port, cfg.host);
