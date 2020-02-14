/**
 * 为了应对网站私有化，加强隐私性，或者提供网站状态提示，提供此中间件用于网站状态检测：
 * close ：网站暂时关闭
 * update ： 网站升级改造
 * maintain ： 维护
 * private ：私有化，需要提供访问密码
 * public ：公有化，默认为此状态，大家都可以访问
 */

module.exports = async (c, next) => {
  let st = c.service.sitestatus;
  if (st === 'public') {
    await next(c);
  } else if (st === 'close' || st === 'update' || st === 'maintain') {
    let tinfo = '';
    switch (st) {
      case 'close':
        tinfo = '网站暂时关闭！';break;
      case 'update':
        tinfo = '网站升级改造···';break;
      case 'maintain':
        tinfo = '网站维护中···'; break;
      default :
        tinfo = '网站暂停！';
    }
    c.res.body = `<!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width">
      <meta charset="utf-8">
      <title>${c.service.siteinfo.info.sitename}</title>
      <style>
        .main-container {
          width: 86%;
          margin: auto;
        }
      </style>
    </head><body>
      <div class="main-container" style="margin-top:2.5rem;text-align:center;">
        <p style="font-size:128%;color:#4a4a4a;">${tinfo}</p>
      </div>
    </body></html>`;
  } else if (st === 'private') {
    let r = c.service.user.verifyToken(c.query.token, c.service.adminkey);
    if (r === false || c.ip !== r.ip) {
      c.res.body = {
        status : 'EPERMDENY',
        errmsg : '网站内容未发布'
      };
      return ;
    }
    await next(c);
  } else {
    await next(c);
  }
};
