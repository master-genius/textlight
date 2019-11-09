const fs = require('fs');

class download {
  constructor (options) {
    this.path = options.path;
    this.max = options.max; //最大同时下载数
    this.count = 0;
  }

  async middleware (c, next) {
    c.res.body = null;
    let filename = decodeURIComponent(c.param.starPath.trim());
    if (filename.length == 0) {
      c.res.body = '资源没有发现';
      c.status(404);
      return ;
    }
    let filepath = `${this.path}/${filename}`;
    try {
      fs.accessSync(filepath, fs.constants.F_OK);
    } catch (err) {
      c.res.body = '资源没有发现';
      c.status(404);
      return ;
    }

    if (this.count >= this.max) {
      c.status(429);
      c.res.body = '请求太多，请稍后再试';
      return ;
    }

    c.setHeader('content-type', 'application/octet-stream');

    let fst = fs.statSync(filepath);
    c.setHeader('content-length', fst.size);

    let cdp = 'attchment;filename='+encodeURIComponent(filename)
                + '; filename*=utf-8\'\''+encodeURIComponent(filename);

    c.setHeader('content-disposition', cdp);
    this.count += 1;
    var self = this;
    await new Promise((rv, rj) => {
        let dst = fs.createReadStream(filepath);
        dst.pipe(c.response || c.stream, {end: false});
        dst.on('end', () => {
            rv();
        });
        dst.on('error', err => {
          rj(err);
        });
    }).finally(() => {
      self.count -= 1;
    });
  }

}

module.exports = download;
