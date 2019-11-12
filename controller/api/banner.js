const fs = require('fs');

class banner {
  constructor () {

  }

  async list (c) {
    c.res.body = {
      banner : [],
      detail : null
    };

    try {
      c.res.body.banner = await new Promise((rv, rj) => {
        fs.readdir(c.service.sitedata+'/image/banner', (err, flist) => {
          if (err) {
            rj(err);
          } else {
            rv(flist);
          }
        });
      });
    } catch (err) {
      c.res.body.banner = [];
    }

    try {
      let detail = await c.service.funcs.readFile(
          c.service.sitedata+'/box/banner.json');
      c.res.body.detail = JSON.parse(detail);
    } catch (err) {
      c.res.body.detail = null;
    }
    
  }
}

module.exports = banner;
