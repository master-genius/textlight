const pg = require('pg');
const dbcfg = require('./dbconfig');

var pgdb = new pg.Pool(dbcfg);

;(async () => {
  let sql = 'SELECT title,is_public,tags FROM docs WHERE id=$1';
  let a = [
    '\'1 OR is_public=0\'; SELECT * FROM admin WHERE id != \'\''
  ];
  let ret = await pgdb.query(sql, a);
  console.log(ret);
})();

