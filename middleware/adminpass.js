module.exports = async (c, next) => {
  let r = c.service.user.verifyToken(c.query.token, c.service.adminkey);
  if (r === false || c.ip !== r.ip) {
    c.res.body = c.service.api.ret('ENOTLOGIN');
    return ;
  }
  c.box.user = r;
  await next(c);
};
