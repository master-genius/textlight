class site {
  constructor () {
    this.param = '/';
  }

  async get (c) {
    c.res.body = c.service.api.ret(0, c.service.siteinfo.info);
  }

  async create (c) {
    try {
      c.body = JSON.parse(c.body);
      await c.service.siteinfo.setall(c.body);
      c.service.siteinfo.noticeUpdate();
      if (c.body.theme !== undefined) {
        c.service.siteinfo.noticeChangeTheme();
      }
      c.res.body = c.service.api.ret(0, '请刷新页面查看');
    } catch (err) {
      c.res.body = c.service.api.ret('EBADDATA');
    }

  }

}

module.exports = site;
