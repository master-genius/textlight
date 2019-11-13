/**
 * logger对每个进程都是唯一的，只记录要求的url。
 * 非全局日志，如果有用户在试探一些不存在的路径，
 * 则不会被捕捉到。
 * 
 * 记录格式：
 *   method | path | user_agent | status | timestamp | ip
 */

const fs = require('fs');

class logger {
  constructor (options = {}) {
    this.routes = '*';

    //超过50条则写入文件并清空
    this.logcache = [];

    //如果已经超过100000条则会清空，并把outcount++
    this.count = 0;
    this.outcount = 0;
    this.cacheCount = 50;
    this.max = 100000;
    this.logfile = __dirname + '/../website/log/' + process.pid + '.log';

    if (options.routes !== undefined) {
      this.routes = options.routes;
    }

    if (options.cache) {
      this.cacheCount = options.cache;
    }

  }

  cacheLog (c, startTime) {
    if (this.routes !== '*' && this.routes.indexOf(c.routepath) < 0) {
      //console.log(c.routepath);
      return ;
    }
    let logtext = `${c.method} | ${decodeURIComponent(c.url.href)} | ${c.headers['user-agent']} | ${c.status()} | ${startTime} | ${c.ip} | ${c.headers['referer'] || '--'}`;
    this.logcache.push(logtext);
    var flag = 'a+';
    if (this.logcache.length >= this.cacheCount) {
      if (this.count >= this.max) {
        flag='w+';
        this.count = 0;
        this.outcount += 1;
      }
      let cacheText = this.logcache.join('\n') + '\n';
      this.logcache = [];
      var the = this;
      fs.writeFile(this.logfile, cacheText, {flag: flag}, err => {
        if (err) {
          console.log(err);
        } else {
          the.count += the.cacheCount;
        }
      });
    }
  }

  async middleware (c, next) {
    let startTime = Date.now();
    await next(c);
    this.cacheLog(c, startTime);
  }

}

module.exports = logger;
