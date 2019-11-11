const fs = require('fs');

class image {

  constructor () {
    //this.imageCache = {};
    this.mode = 'restful';
    this.param = '/*';
  }

  async get (c) {
    let imgfile = `${c.service.siteimgpath}/${c.param.starPath}`;
    try {
      fs.accessSync(imgfile, fs.constants.F_OK);
    } catch (err) {
      c.status(404);
      return ;
    }

    c.setHeader('Cache-control', 'public, max-age=86400');
    c.res.encoding = 'binary';

    try {
      let funcs = c.service.funcs;
      c.res.body = await funcs.readFile(imgfile, 'binary');
      var content_type = funcs.getContentType(c.helper.extName(c.param.starPath));
      if (content_type.length > 0) {
        c.setHeader('content-type', content_type);
      }
      c.setHeader('content-length', c.res.body.length);
    } catch (err) {
      c.status(404);
    }
  }

}

module.exports = image;
