const fs = require('fs');

class banner {
  constructor () {

  }

  async list (c) {
    try {
      c.res.body = await new Promise((rv, rj) => {
        fs.readdir(c.service.imagepath+'/banner', (err, flist) => {
          if (err) {
            rj(err);
          } else {
            rv(flist);
          }
        });
      });
    } catch (err) {
      c.res.body = [];
    }
  }
}

module.exports = banner;
