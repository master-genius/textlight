module.exports = async (c, next) => {
  var stat = false;
  for (let i=0; i<c.service.allowList.length; i++) {
    if (typeof c.service.allowList[i] === 'string') {
      if (c.service.allowList[i].indexOf(c.ip) == 0) {
        stat = true;
        break;
      }
    } else if (c.service.allowList[i] instanceof RegExp) {
      if (c.service.allowList[i].test(c.ip)) {
        stat = true;
        break;
      }
    }
  }

  if (stat) {
    await next(c);
  } else {
    c.setHeader('content-type', 'text/html; charset=utf-8');
    c.res.body = '<div style="text-align:center;">DENY</div>';
  }
};
