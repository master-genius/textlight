/**
 * 用于返回相关页面需要的服务数据，比如在页面侧边展示相关链接或其他内容。
 */

const fs = require('fs');

class side {
  constructor () {
    this.sidejson = {
      list : []
    };

    this.getTime = 0;
    this.param = '/word';

    this.wordTime = 0;
    this.words = '';
  }

  async getWord (path) {
    if (this.wordTime + 600000 > Date.now()) {
      return this.words;
    }
    try {
      this.words = await new Promise((rv, rj) => {
        fs.readFile(path, {encoding:'utf8'}, (err, data) => {
          if (err) {
            rj(err);
          } else {
            rv(data);
          }
        });
      });
      this.wordTime = Date.now();
    } catch (err) {
      //console.log(err);
      this.words = '';
      this.wordTime = 0;
    }
    return this.words;
  }

  /**
   * 返回side中某一项具体内容,
   * 其实只需要返回文字类型，因为图片可以通过siteimage返回
   * @param {*} c 
   */
  async get (c) {
    let r = await this.getWord(c.service.sitedata+'/side.html');
    c.res.body = c.service.api.ret(0, r);
  }

  /**
   * 返回list全部内容
   * @param {*} c 
   * 
   */
  /* async list (c) {
    let r = await this.getList(c.service.sitedata, 'side.json');
    if (r === null) {
      c.res.body = c.service.api.ret('EBADDATA','数据错误');
      return ;
    }
    c.res.body = c.service.api.ret(0, r.table);
  }

  async getList(path, fname) {
    let wfname = `${path}/side/word.md`;
    path = `${path}/${fname}`;

    if (this.getTime + 600000 > Date.now() ) {
      return this.sidejson;
    }
    try {
      var sjson = await new Promise((rv, rj) => {
        fs.readFile(path, {encoding:'utf8'}, (err, data) =>{
          if (err) {
            rj(err);
          } else {
            rv(data);
          }
        });
      });
      this.sidejson = JSON.parse(sjson);
      if (this.sidejson && this.sidejson.table && this.sidejson.table.word) {
        this.sidejson.table.word.text = await  new Promise((rv, rj) => {
          fs.readFile(wfname, {encoding:'utf8'}, (err, data) => {
            if (err) {
              rj(err);
            } else {
              rv(data);
            }
          });
        });
      }
      return this.sidejson;
    } catch (err) {
      console.log(err);
      return null;
    }
  } */

  __mid () {
    return [
      {
        name : 'sitestatus'
      }
    ]
  }

}

module.exports = side;
