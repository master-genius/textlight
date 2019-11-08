class content {

  constructor () {

  }

  async get (c) {
    let uid = (c.box.user.role === 'root' || c.box.user.role === 'super') 
              ? null : c.box.user.id;
    let data = await c.service.docs.aget(c.param.id, uid);
    if (data === null) {
      c.res.body = c.service.api.ret('ENOTFD');
    } else {
      c.res.body = c.service.api.ret(0, data);
    }
  }

  async list (c) {
    if (c.box.user.role === 'root' || c.box.user.role === 'super') {
      c.query.uid = null;
    } else {
      c.query.uid = c.box.user.id;
    }
    c.query.isdel = 0;
    let data = await c.service.docs.adoclist(c.query);
    c.res.body = c.service.api.ret(0, data);
  }

  /**
   * 
   * @param {*} c 
   * c.body是已经过滤处理完毕的数据。
   */
  async create (c) {
    c.body.adminid = c.box.user.id;
    c.body.adminname = c.box.user.username;
    let data = await c.service.docs.post(c.body);
    if (data === false) {
      c.res.body = c.service.api.ret('EUEF', 'failed create doc');
    } else {
      c.res.body = c.service.api.ret(0, data);
    }
  }

  /**
   * 
   * @param {*} c 
   * c.body中是id数组，是已经过滤处理的
   */
  async delete (c) {
    let idlist = c.body;
    let uid = (c.box.user.role === 'root' || c.box.user.role === 'super') 
              ? null : c.box.user.id;
    let soft = true;
    if (c.query.soft !== undefined) {
      soft = parseInt(c.query.soft) ? true : false;
    }
    let data = await c.service.docs.removeAll(idlist, uid, soft);
    c.res.body = c.service.api.ret(0, data);
  }

  /**
   * 
   * @param {*} c 
   * c.body 中的数据在中间件中已经过滤处理完毕。
   */
  async update (c) {
    let uid = (c.box.user.role === 'root' || c.box.user.role === 'super') 
            ? null : c.box.user.id;
    c.body.id = c.param.id;
    let data = await c.service.docs.update(c.body, uid);
    if (data) {
      c.res.body = c.service.api.ret(0);
    } else {
      c.res.body = c.service.api.ret('EUDEF', 'update failed');
    }
  }

  __mid () {
    return [
      {
        name : 'docfilter',
        path : ['create', 'update', 'delete']
      }
    ];
  }

}

module.exports = content;
