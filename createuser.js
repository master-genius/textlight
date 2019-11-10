const funcs = require('./functions');
const pg = require('pg');
const dbcfg = require('./self/dbconfig');
const admin = require('./model/admin');

var pgdb = new pg.Pool(dbcfg);

var adm = new admin(pgdb);

/**
 * 用户角色分为：root、editer、super
 * editer可以编辑并管理内容，但是不能删除或更改其他editer的数据。
 * super除了不可以管理用户之外，都可以操作。
 */

let salt = funcs.makeSalt();
let pass = funcs.makeSalt(7);

;(async () => {
  let u = await adm.get('root');
  if (u !== null) {
    console.log('root用户已存在');
    return ;
  }

  let r = await adm.create({
    username : 'root',
    passwd : pass,
    salt : salt,
    email : 'aa@12.com',
    role : 'root'
  });

  if (r) {
    console.log(r);
  }
  console.log(`最高级用户：root, 初始密码：${pass}。请登录管理后台重新设置密码。`);
  //process.exit(0);
  pgdb.end();
})();
