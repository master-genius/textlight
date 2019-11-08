const fs = require('fs');

class image {

  constructor () {
    this.imageCache = {};
    this.mode = 'restful';
    this.param = '/*';
    var self = this;
    setInterval(() => {
      self.imageCache = {};
    }, 600000);
  }

  async get (c) {
    let imgfile = `${c.service.sitedata}/${c.param.starPath}`;
    try {
      fs.accessSync(imgfile, fs.constants.F_OK);
    } catch (err) {
      c.status(404);
      return ;
    }

    c.setHeader('Cache-control', 'public, max-age=86400');
    c.res.encoding = 'binary';

    if (this.imageCache[imgfile]) {
      c.setHeader('content-type', this.imageCache[imgfile]['content-type']);
      c.setHeader('content-length', this.imageCache[imgfile]['content-length']);
      c.res.body = this.imageCache[imgfile]['data'];
      return ;
    }

    try {
      let funcs = c.service.funcs;
      c.res.body = await funcs.readFile(imgfile, 'binary');
      var content_type = funcs.getContentType(c.helper.extName(c.param.starPath));
      if (content_type.length > 0) {
        c.setHeader('content-type', content_type);
      }
      c.setHeader('content-length', c.res.body.length);

      this.imageCache[imgfile] = {
        'content-type' : content_type,
        data : c.res.body,
        'content-length' : c.res.body.length
      };
        
    } catch (err) {
      c.status(404);
    }
  }

}

module.exports = image;
