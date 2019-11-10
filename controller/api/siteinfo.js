class siteinfo {
  constructor () {
    this.mode = 'callback';
  }

  async callback (c) {
    let si = {
      title : c.service.siteinfo.info.title,
      footer : c.service.siteinfo.info.footer,
      sitename : c.service.siteinfo.info.sitename,
      copyright: c.service.siteinfo.info.copyright
    }
    c.res.body = c.service.api.ret(0, si);
  }


}

module.exports = siteinfo;
