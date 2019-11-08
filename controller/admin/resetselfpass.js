class resetselfpass {
  constructor () {
    this.param = '/';
  }

  async update (c) {
    try {
      let u = JSON.parse(c.body);
      let rp = await c.service.admin.verifyPasswd(c.box.user.username, u.passwd);
      if (!rp) {
        c.res.body = c.service.api.ret('EPERMDENY', '权限验证失败');
        return ;
      }
      let r = await c.service.admin.setPasswd(c.box.user.username, 
            u.newpasswd, 'username');
      if (!r) {
        c.res.body = c.service.api.ret('EUDEF', '重置失败，请稍后重试');
        return ;
      }
      c.res.body = c.service.api.ret(0);
    } catch (err) {
      //console.log(err);
      c.res.body = c.service.api.ret('EBADDATA', '数据错误');
    }

  }
}

module.exports = resetselfpass;
