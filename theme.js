/**
 * 用于提供主题文件加载机制，在主题文件中，必须要存在一个page.js文件。
 * 并且导出模块必须要提供init函数用于初始化操作。
 * 提供可选的reload函数用于重新初始化操作。
 * 提供find函数用于返回对应的页面。
 */

 const fs = require('fs');
 const funcs = require('./functions');

class theme {
  constructor (options) {
    this.path = options.path; //主题目录
    this.name = options.name; //主题文件目录名称
    this.themepath = `${this.path}/${this.name}`;
    this.siteinfo = options.siteinfo;
  }

  load () {
    this.themepath = `${this.path}/${this.name}`;
    let tfile = this.themepath+'/page.js';
    try {
      fs.accessSync(tfile, fs.constants.F_OK);
    } catch (err) {
      console.log('主题文件没有发现，请确保使用了正确的主题');
      throw err;
    }

    var th = require(tfile);
    this.t = new th({
      path : this.themepath,
      siteinfo : this.siteinfo,
      fs : fs,
      funcs : funcs
    });

    if (this.t.init === undefined || typeof this.t.init !== 'function') {
      throw new Error('主题文件没有提供init函数用于初始化操作');
    }

    this.t.init();
  }

  reload (si) {
    this.siteinfo = si;
    if (this.t.reload === undefined || typeof this.t.reload !== 'function') {
      this.t.init();
    } else {
      this.t.reload(si);
    }
  }

  setTheme(tname) {
    var oldname = this.name;
    var oldt = this.t;
    try {
      this.name = tname;
      this.load();
    } catch (err) {
      console.log(err);
      console.log('切换主题错误，设置回之前的主题');
      this.t = oldt;
      this.name = oldname;
    }
  }

  find (pname) {
    return this.t.find(pname);
  }

}

module.exports = theme;
