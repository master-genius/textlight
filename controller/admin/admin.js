class admin {
  constructor () {

  }

  async get (c) {
    let a = c.service.admin.get(c.param.id);
    if (a === null) {
      c.res.body = c.service.api.ret('ENOTFD');
    } else {
      c.res.body = c.service.api.ret(0, a);
    }
  }

  async list (c) {
    c.res.body = c.service.api.ret(0, await c.service.admin.list());
  }

  async create (c) {
    let r = await c.service.admin.create(c.body);

    if (r === false) {
      c.res.body = c.service.api.ret('EUDEF', '创建管理员失败，请检查是否已存在');
      return ;
    }

    c.res.body = c.service.api.ret(0, r);
  }

  async delete (c) {
    let r = await c.service.admin.delete(c.param.id);
    if (r === false) {
      c.res.body = c.service.api.ret('EUDEF', '删除失败，请检查权限');
      return ;
    }
    c.res.body = c.service.api.ret(0);
  }

  async update (c) {
    /* if (c.box.user.role === 'root') {
      if (c.body.username !== undefined || c.body.role !== undefined) {
        c.res.body = c.service.api.ret('EBADDATA');
        return ;
      }
    } */
    
    c.body.id = c.param.id;
    if (c.box.user.role === 'root' 
      && c.body.role !== undefined 
      && c.box.user.id === c.param.id)
    {
      c.res.body = await c.service.api.ret('EUDEF', 'root用户不能修改自己的身份');
      return ;
    }
    let r = await c.service.admin.update(c.body);
    if (r) {
      c.res.body = await c.service.api.ret(0);
    } else {
      c.res.body = await c.service.api.ret('EUDEF', '更新失败，请检查数据格式');
    }
  }

  __mid () {
    return [
      {
        name : 'rootpass',
        path : ['create', 'delete', 'update','get','list']
      },
      {
        name : 'adminDataFilter',
        path : ['create', 'update']
      }
    ];
  }

}

module.exports = admin;
