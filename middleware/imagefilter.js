module.exports = async (c, next) => {
  let f = c.getFile('image');
  if (f === null) {
    c.res.body = c.service.api.ret('EUDEF', '没有发现图片');
    return ;
  }

  if (f.length > 3000000) {
    c.res.body = c.service.api.ret('EUDEF', '图片超过限制大小');
    return ;
  }

  let ctypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (ctypes.indexOf(f['content-type']) < 0) {
    c.res.body = c.service.api.ret('EUDEF', '支持.jpg, .png, .gif格式图片');
    return ;
  }

  await next(c);
};