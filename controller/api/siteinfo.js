class siteinfo {
  constructor () {
    this.mode = 'callback';
  }

  async callback (c) {
    c.res.body = c.service.api.ret(0, c.service.siteinfo.info);
  }


}

module.exports = siteinfo;
