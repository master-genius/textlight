const funcs = require('./functions');
const pg = require('pg');
const dbcfg = require('./dbconfig');
const admin = require('./model/admin');

var pgdb = new pg.Pool(dbcfg);

var adm = new admin(pgdb);

/**
 * 用户角色分为：root、editer、inspector、super
 * editer可以编辑并管理内容，但是不能删除或更改其他editer的内容
 * inspector是审核员，可以设置某些内容是否可见。
 * super是inspector和editor的结合。
 */

;(async () => {
  let r = adm.create({
    username : 'root',
    passwd : 'wy1001!',
    email : 'aa@12.com',
    role : 'root'
  });

  if (r) {
    console.log(r);
  }
})();