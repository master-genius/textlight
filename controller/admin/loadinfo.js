const os = require('os');
const fs = require('fs');

class loadinfo {
  constructor () {
    this.mode = 'callback';
    this.method = 'GET';
    this.li = '';
    if (os.platform() !== 'win32') {
      this.getLoadInfo();
    }
  }

  async getLoadInfo() {
    var self = this;
    setInterval(async () => {
      try {
        self.li = await new Promise((rv, rj) => {
          fs.readFile('/tmp/loadinfo.log',{encoding:'utf8'}, (err, data) => {
            if (err) {
              rj(err);
            } else {
              rv(data);
            }
          });
        });
      } catch (err) {}
    }, 2000);
  }

  async callback (c) {
    c.res.body = this.li;
  }
}

module.exports = loadinfo;
