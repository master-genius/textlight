module.exports = async (c, next) => {
  if (c.box.user.role !== 'root') {
    c.res.body = c.service.api.ret('EPERMDENY');
    return ;
  }
  await next(c);
};
