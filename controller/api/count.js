class count {
  constructor () {
    this.mode = 'callback';
  }

  async callback (c) {
    c.query.isdel = 0;
    let r = await c.service.docs.ucount(c.query);
    c.res.body = c.service.api.ret(0, r);
  }

}

module.exports = count;
