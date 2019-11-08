class resetpasswd {
  constructor () {
    
  }

  /**
   * 
   * @param {*} c 
   * 只有root用户可以更新其他人的密码
   */
  async update (c) {
    try {
      var u = JSON.parse(c.body);
      if (u.id === undefined || u.newpasswd === undefined || u.passwd === undefined)
      {
        throw new Error('bad data');
      }
    } catch (err) {
      c.res.body = c.service.api.ret('EBADDATA');
      return ;
    }
    //only root can reset others passwd
    if (c.box.user.id !== u.id && c.box.user.role !== 'root') {
      c.res.body = c.service.api.ret('EPERMDENY');
      return ;
    }
    let rp = await c.service.admin.verifyPasswd(c.box.user.username, u.passwd);
    if (!rp) {
      c.res.body = c.service.api.ret('EPERMDENY');
      return ;
    }
    let r = await c.service.admin.setPasswd(u.id, u.newpasswd);
    if (!r) {
      c.res.body = c.service.api.ret('EUDEF', '更新密码失败');
      return ;
    }
    c.res.body = c.service.api.ret(0);
  }
}

module.exports = resetpasswd;
