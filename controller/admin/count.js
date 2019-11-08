class count {
  constructor () {
    this.mode = 'callback';
  }

  async callback (c) {
    if (c.box.user.role !== 'root' && c.box.user.role !== 'super') {
      c.query.uid = c.box.user.id;
    }
    if (c.query.isdel === undefined) {
      c.query.isdel = 0;
    }
    let r = await c.service.docs.count(c.query);
    c.res.body = c.service.api.ret(0, r);
  }

}

module.exports = count;
