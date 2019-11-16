class news {
  constructor () {
    this.mode = 'restful';
    this.param = '/*';
  }

  async get (c) {
    let id = decodeURIComponent(c.param.starPath);
    let r = c.service.docdb.getById(id);
    if (r === null) {
      c.status(404);
      return ;
    }

    r.status = 0;
    c.res.body = r;
  }

  async list (c) {
    let cstr = c.query.q || '';
    let count = c.query.count !== undefined ? parseInt(c.query.count) : 10;
    if (count <= 0) { count = 25; }
    let offset = c.query.offset !== undefined
                    ? parseInt(c.query.offset) 
                    : 0;
    if (offset < 0) { offset = 0; }

    /* let group = null;
    if (c.query.group !== undefined && c.query.group.length > 0) {
        group = c.query.group;
    } */
    cstr = cstr.substring(0, 20);

    let result = c.service.docdb.select(cstr, count, offset, '_news');

    c.res.body = result;
  }
}

module.exports = news;
