module.exports = {

  themePath: 'themes',
  
  //32长度的字符
  adminkey : 'xiong-an-dao-jian-wang-luo-ke-ji',
  apidomain : 'http://www.d.com',
  adminapi : '/admin',
  port : 2022,
  host : '0.0.0.0',
  apikey : 'bu-xiang-shei-dou-ke-yi-diao-yong', //API调用的key,暂时没有使用,
  //IP白名单
  allowList: [
    '127.0.0.1'
  ],
  cors : [
    //'www.d.com'
  ],

  //会话有效期，秒
  expires : 18000,

  //服务选项

  debug: true,

  maxConn: 500,

  maxIPCache: 100000,

  peerTime: 1,

  maxIPRequest: 30,

  bodyMaxSize: 5000000,

  useLimit: false,

  //路由前缀分组，设置后，则需要在每个路径前都要加上此前缀
  pre : '',

  //是否启用日志
  logger : false,
  loggerRoutes : [
    '/api/content/:id',
    '/page/:name',
    '/',
  ],
  loggerCacheCount: 50,

  useDownload : true,
  downloadPath: __dirname + '/../website/download',
  downloadMax: 2,


  /**
   * 网站状态
   * close public pirvate update maintain
   */

  status : 'private',
  
  /**
   * 针对高级用户，如果你是开发者，则可以设置启用自编写函数用于随机密码的验证。
   * 这样，安全度非常高。
   * 这时候，并非原密码没有用，而是输入密码时还要使用//跟上新的密码才可以登录。
   * 如何使用，则交给开发者决定。
   */
  usePassCallback: false,
  permsource : [3, 4, 7, 23, 45, 67, 342, 651, 568, 'awedc', 'ahord'],
  passCallback: (a, pstr) => {
    return pstr == `${a[0]}${a[2]}`;
    /* try {
      let p = `${(a[0] + a[1]) * a[2]}${a[3]}`;
      return (p == pstr);
    } catch (err) {
      return false;
    } */
  }
};
