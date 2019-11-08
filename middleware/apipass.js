module.exports = async (c, next) => {
  c.res.body = c.service.api.ret('EPERMDENY');
  if (c.query.apitoken && c.query.key) {
    let h = c.service.funcs.md5(`${c.query.key}${c.service.apikey}`);
      if (h !== c.query.apitoken) {
        return ;
      }
  } else {
    return ;
  }
  await next(c);
};
