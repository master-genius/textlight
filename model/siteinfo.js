const funcs = require('../functions');
const fs = require('fs');

class siteinfo {
  constructor (options) {
    this.info = {
      sitename : '',
      footer : '',
      title : '',
      theme : 'default',
      copyright : ''
    };
    this.path = options.path;
    this.watchFile = options.watchFile;
    this.watchTheme = options.watchTheme;
    this.themedir = options.themedir;
    this.types = Object.keys(this.info);
  }

  init () {
    try {
      this.info.title = fs.readFileSync(`${this.path}/title`, {encoding:'utf8'});
      this.info.theme = fs.readFileSync(`${this.path}/theme`, {encoding:'utf8'});
      this.info.theme = this.info.theme.trim();
      this.info.sitename = fs.readFileSync(`${this.path}/sitename`, {encoding:'utf8'});
      this.info.footer = fs.readFileSync(`${this.path}/footer`, {encoding:'utf8'});
      this.info.copyright = fs.readFileSync(`${this.path}/copyright`, {encoding:'utf8'});
    } catch (err) {
      console.log(err.message);
    }
    try {
      this.info.themeList = fs.readdirSync(this.themedir);
    } catch (err) {}
  }
  
  reload () {
    this.info = {};
    this.init();
  }

  async setinfo (data, type) {
    if (this.types.indexOf(type) < 0) {
      return false;
    }
    try {
      let r = await funcs.writeFile(`${this.path}/${type}`, data);
      return true;
    } catch (err) {
      return false;
    }
  }

  noticeUpdate() {
    funcs.writeFile(this.watchFile, `${Date.now()}`);
  }

  noticeChangeTheme() {
    funcs.writeFile(this.watchTheme, `${Date.now()}`);
  }

  async setall (dobj) {
    for (let k in dobj) {
      await this.setinfo(dobj[k], k);
    }
  }

}

module.exports = siteinfo;