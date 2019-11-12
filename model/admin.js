/**
 * admin是基于文件的机制，所以操作都是在对文件进行读写
 */

const funcs = require('../functions');
const fs = require('fs');

var admin = function (db) {
  if (!(this instanceof admin)) {
    return new admin(db);
  }

  this.db = db;
  this.aid = function (pstr = '') {
    let pre = `${Date.now()}${Math.random()}${pstr}`;
    return funcs.sha1(pre);
  };

  this.hashPass = function (p, s) {
    return funcs.sha512(`${p}${s}`);
  }

  this.roles = [
    'root', 'super', 'inspector', 'editer'
  ];
  
};

admin.prototype.get = async function (username) {
  let sql = 'SELECT * FROM admin WHERE username=$1';
  let r = await this.db.query(sql, [
    username
  ]);
  if (r.rowCount <= 0) {
    return null;
  }
  return r.rows[0];
};

admin.prototype.list = async function () {
  let sql = 'SELECT id,username,email,role,forbid FROM admin';
  let r = await this.db.query(sql);
  return r.rows;
};

/**
 *    username,passwd,email,role,forbid
 */

admin.prototype.create = async function (u) {
  let sql = 'INSERT INTO admin (id, username, passwd, email, salt, role) '
    +' VALUES ($1,$2, $3,$4,$5, $6);';

  let id = this.aid();
  let salt = funcs.makeSalt();
  let passwd = funcs.sha512(`${u.passwd}${salt}`);
  let a = [
    id, u.username, passwd, u.email, salt, u.role
  ];

  let r = await this.db.query(sql, a);
  if (r.rowCount <= 0) {
    return false;
  }
  return id;
};

admin.prototype.delete = async function (id) {
  let sql = `DELETE FROM admin WHERE id=$1 AND role != 'root'`;
  let r = await this.db.query(sql, [
    id
  ]);
  if (r.rowCount <= 0) {
    return false;
  }
  return true;
};

admin.prototype.update = async function (u) {
  let sql = 'UPDATE admin SET ';
  let a = [];
  var i=1;
  for (let k in u) {
    if (k === 'id' || k === 'salt' || k === 'passwd') {continue;}
    
    sql += `${k}=$${i},`;
    i+=1;
    a.push(u[k]);
  }

  a.push(u.id);
  
  sql = `${sql.substring(0, sql.length-1)} WHERE id=$${i}`;

  let r = await this.db.query(sql, a);
  if (r.rowCount <= 0) {
    return false;
  }
  return true;
};

admin.prototype.setPasswd = async function (id, passwd, ufield = 'id') {
  let sql = `UPDATE admin SET passwd=$1,salt=$2 WHERE ${ufield}=$3`;
  let salt = funcs.makeSalt();
  let npass = this.hashPass(passwd, salt);
  let r = await this.db.query(sql, [
    npass, salt, id
  ]);

  if (r.rowCount <= 0) {
    return false;
  }
  return true;
};

admin.prototype.verifyPasswd = async function (username, passwd) {
  
  let sql = 'SELECT id,username,passwd,salt FROM admin WHERE username=$1';
  let u = await this.db.query(sql, [username]);
  if (u.rowCount <= 0) {
    return false;
  }
  let npass = this.hashPass(passwd, u.rows[0].salt);
  if (npass === u.rows[0].passwd) {
    return true;
  }
  return false;
};

module.exports = admin;
