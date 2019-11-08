module.exports = async (c, next) => {
  if (!c.headers['referer']) {
    c.headers['referer'] = '';
  }

  var stat = false;
  if (c.service.cors.length == 0) {
    stat = true;
  } else {
    for (let i=0; i<c.service.cors.length; i++) {
      if (c.headers['referer'].indexOf(c.service.cors[i]) == 0) {
        stat = true;
          break;
      }
    }
  }

  if (stat) {
    await next(c);
  } else {
    c.status(404);
  }

};