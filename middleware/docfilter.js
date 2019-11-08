module.exports = async (c, next) => {
  try {
    var jsondata = JSON.parse(c.body);
  } catch (err) {
    c.res.body = c.service.api.ret('EBADDATA');
    return ;
  }

  if (c.method === 'DELETE') {
    if (c.body.indexOf(';') >= 0) {
      c.res.body = c.service.api.ret('EBADDATA');
      return ;
    }
    c.body = jsondata;
  } else {
    c.body = jsondata;
    if (c.body.title === undefined 
      || c.body.title === ''
      || c.body.title === null)
    {
      c.res.body = c.service.api.ret('EUDEF', '标题不能为空');
      return ;
    }

    if (c.body.content === undefined 
      || c.body.content === ''
      || c.body.content === null)
    {
      c.res.body = c.service.api.ret('EUDEF', '内容不能为空');
      return ;
    }
    c.body.title = c.body.title.replace(/\</ig, '&lt;');
    c.body.title = c.body.title.replace(/\>/ig, '&gt;');
  }

  await next(c);
};
