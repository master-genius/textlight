module.exports = async (c, next) => {
  if (c.query.adminpass === undefined || c.query.adminpass !== c.service.urlpass) {
    c.res.body = c.service.api.ret('EPERMDENY');
  } else {
    await next(c);
  }
};
