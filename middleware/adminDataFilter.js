/**
 * 针对管理员用户创建或更新用户信息的操作，在真实的请求之前，先检测数据。
 */
module.exports = async (c, next) => {
  try {
    let d = JSON.parse(c.body);
    c.body = d;
    await next(c);
  } catch (err) {
    c.res.body = c.service.api.ret('EBADDATA');
  }
};
