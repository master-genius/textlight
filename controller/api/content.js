class content {
  constructor () {

  }

  async get (c) {
    let data = await c.service.docs.get(c.param.id);
    if (data === null) {
      c.res.body = c.service.api.ret('ENOTFD');
    } else {
      c.res.body = c.service.api.ret(0, data);
    }
  }

  async list (c) {
    c.setHeader('Cache-control', 'public,max-age=300');
    c.query.isdel = 0;
    let data = await c.service.docs.doclist(c.query);
    c.res.body = c.service.api.ret(0, data);
  }

  __mid () {
    return [
      {
        name : 'sitestatus',
      }
    ];
  }
}

module.exports = content;
