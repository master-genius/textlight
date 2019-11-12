const funcs = require('../functions');

var docs = function (db) {
  if (!(this instanceof docs)) {
    return new docs(db);
  }
  this.db = db;
  this.genid = function (pstr = '') {
    let pre = `${Date.now()}${Math.random()}${pstr}`;
    return funcs.sha1(pre).substring(0,12);
  };
};

docs.prototype.parseCond = function (args) {

  let offset = 0;
  let pagesize = 12;
  let kwd = null;

  if (args.kwd !== undefined) {
    kwd = args.kwd.replace(/[\;\*\s]+/ig, '%');
    kwd = `%${kwd}%`;
  }

  if (args.pagesize !== undefined && !isNaN(args.pagesize)) {
    pagesize = parseInt(args.pagesize);
    if (pagesize <= 0 || pagesize > 30) {
      pagesize = 12;
    }
  }

  if (args.offset !== undefined && !isNaN(args.offset)) {
    offset = parseInt(args.offset);
    if (offset < 0) {offset = 0;}
  }

  let tag = null;
  if (args.tag !== undefined) {
    tag = args.tag.trim().replace(/[\;\+\-]+/ig, '');
  }

  let isdel = null;
  if (args.isdel !== undefined) {
    isdel = args.isdel ? 1 : 0;
  }

  let condsql = '';
  let limitsql = ` LIMIT ${pagesize} OFFSET ${offset}`;
  if (kwd !== null) {
    condsql += ` (title ILIKE '${kwd}' OR keywords ILIKE '${kwd}') `;
  }
  if (tag !== null  ) {
    if (kwd !== null) {
      condsql += ` AND `;
    }
    condsql += ` tags ILIKE '%${tag}%' `;
  }

  if (isdel !== null) {
    if (kwd || tag) {
      condsql += ' AND ';
    }
    condsql += ` is_delete=${isdel} `;
  }

  if (args.uid !== undefined && args.uid !== null) {
    if (condsql.length > 0) {
      condsql += ' AND ';
    }
    condsql += ` adminid='${args.uid}' `;
  }

  if (args.type !== undefined) {
    if (condsql.length > 0) {
      condsql += ' AND ';
    }
    condsql += ` ctype='${args.type.replace(/[\;]+/ig,'')}' `;
  }

  if (condsql.length > 0) {
    condsql = ` WHERE ${condsql} `;
  }

  return {
    limit : limitsql,
    cond : condsql
  };
};

docs.prototype.insql = (idlist) => {
  let idsql = '(';
  for (let i=0; i<idlist.length; i++) {
    idsql += `'${idlist[i]}',`;
  }
  return (idsql.substring(0, idsql.length-1) + ')');
};

docs.prototype.count = async function (args = {}) {
  let sql = 'SELECT count(*) as total FROM docs ';
  sql  += this.parseCond(args).cond;

  let r = await this.db.query(sql);
  if (r.rowCount <= 0) {
    return 0;
  }
  return r.rows[0].total;
};

docs.prototype.ucount = async function (args = {}) {
  let sql = 'SELECT count(*) as total FROM docs ';
  sql  += this.parseCond(args).cond + ' AND is_public=1 AND is_hidden=0';

  let r = await this.db.query(sql);
  if (r.rowCount <= 0) {
    return 0;
  }
  return r.rows[0].total;
}

docs.prototype.doclist = async function (args = {}) {
  
  let r = this.parseCond(args);

  let sql = 'SELECT id,title,keywords,addtime,updatetime,doctype,ctype FROM docs ';

  sql += r.cond + ' AND is_public=1 AND is_hidden=0 ' 
      + ' ORDER BY is_top DESC,updatetime DESC ' + r.limit;

  let ret = await this.db.query(sql);

  return ret.rows;
};

docs.prototype.adoclist = async function (args = {}) {
  let r = this.parseCond(args);
  let sql = 'SELECT * FROM docs ';
  sql += r.cond + ' ORDER BY updatetime DESC ' + r.limit;

  let ret = await this.db.query(sql);
  return ret.rows;
};

docs.prototype.get = async function (id) {
  let sql = 'SELECT id,title,content,tags,keywords,updatetime,doctype,ctype FROM docs WHERE id=$1 AND is_public=1 AND is_hidden=0 AND is_delete=0';

  let ret = await this.db.query(sql, [
    id
  ]);

  if (ret.rowCount > 0) {
    return ret.rows[0];
  }
  return null;
};

docs.prototype.aget = async function (id, uid=null) {
  let sql = 'SELECT * FROM docs WHERE id=$1';

  let a = [id];

  if (uid !== null) {
    sql += ' AND adminid=$2';
    a.push(uid);
  }

  let ret = await this.db.query(sql, a);

  if (ret.rowCount > 0) {
    return ret.rows[0];
  }
  return null;
};

docs.prototype.post = async function (data) {
  let nd = {
    title : '',
    content : '',
    keywords : '',
    adminid : '',
    adminname : '',
    doctype : 'rich-text',
    ctype : 'news',
    is_public : 0,
    gid : 0,
    tags : ''
  };

  for (let k in nd) {
    if (data[k] !== undefined) {
      nd[k] = data[k];
    }
  }

  nd.id = this.genid();
  nd.addtime = nd.updatetime = funcs.formatTime(null, 'middle');

  let sql = 'INSERT INTO docs (id, title, content, keywords, doctype, adminid, adminname, ctype, is_public, addtime, updatetime, tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11, $12)';

  let args = [
    nd.id, nd.title, nd.content, nd.keywords, nd.doctype, nd.adminid, 
    nd.adminname, nd.ctype, nd.is_public, nd.addtime, nd.updatetime, nd.tags
  ];

  let ret = await this.db.query(sql, args);
  if (ret.rowCount <= 0) {
    return false;
  }
  return nd.id;
};

docs.prototype.remove = async function (id, uid = null, soft = true) {
  let sql = 'DELETE FROM docs WHERE id=$1';
  
  if (soft) {
    sql = 'UPDATE docs set is_delete=1 WHERE id=$1';
  }

  let a = [id];
  if (uid) {
    a.push(uid);
    sql += ' AND adminid=$2';
  }
  let ret = await this.db.query(sql, a);
  if (ret.rowCount <= 0) {
    return false;
  }
  return true;
};

docs.prototype.removeAll = async function (idlist, uid=null, soft = true) {
  let sql = 'DELETE FROM docs WHERE id IN ';
  if (soft) {
    sql = 'UPDATE docs SET is_delete=1 WHERE id IN ';
  }

  let idsql = '(';
  for (let i=0; i < idlist.length; i++) {
    idsql += `'${idlist[i]}',`;
  }
  idsql = idsql.substring(0, idsql.length-1) + ')';
  sql += idsql;

  if (uid) {
    sql += ' AND adminid=' + uid;
  }

  let ret = await this.db.query(sql);
  return ret.rowCount;
};

docs.prototype.update = async function (data, uid = null) {
  let sql = 'UPDATE docs SET title=$1,content=$2,keywords=$3,tags=$4,is_public=$5,updatetime=$6, version=version+1 WHERE id=$7';
  let a = [
    data.title, data.content, data.keywords,data.tags,
    data.is_public, funcs.formatTime(null, 'middle'), data.id
  ];
  if (uid !== null) {
    a.push(uid);
    sql += ' AND adminid=$8';
  }

  let ret = await this.db.query(sql, a);
  if (ret.rowCount <= 0) {
    return false;
  }
  return true;
};

docs.prototype.setPublic = async function (idlist, stat = 1, uid = null) {
  let sql = 'UPDATE docs set is_public=$1 WHERE id IN ';
  let idsql = '(';
  for (let i=0; i<idlist.length; i++) {
    idsql += `'${idlist[i]}',`;
  }
  idsql = idsql.substring(0, idsql.length-1) + ')';
  sql += idsql;
  let a = [stat];
  if (uid) {
    sql += ' AND adminid=$2';
    a.push(uid);
  }
  let ret = await this.db.query(sql, a);
  return ret.rowCount;
};

docs.prototype.setTags = async function (idlist, tags, uid = null) {
  let sql = 'UPDATE docs SET tags=$1 WHERE id IN ' + this.insql(idlist);
  let a = [tags];
  if (uid) {
    sql += ' AND adminid=$2';
    a.push(uid);
  }
  let ret = await this.db.query(sql, a);
  return ret.rowCount;
};

docs.prototype.setHidden = async function (idlist, stat = 1, uid = null) {
  let sql = 'UPDATE docs set is_hidden=$1 WHERE id IN ';
  let idsql = this.insql(idlist);
  sql += idsql;
  let a = [stat];
  if (uid) {
    sql += ' AND adminid=$2';
    a.push(uid);
  }
  let ret = await this.db.query(sql, a);
  return ret.rowCount;
};

docs.prototype.setTop = async function (idlist, top = 1, uid = null) {
  let sql = 'UPDATE docs set is_top=$1 WHERE id IN ';
  let idsql = this.insql(idlist);
  sql += idsql;
  let a = [top];
  if (uid) {
    sql += ' AND adminid=$2';
    a.push(uid);
  }
  let ret = await this.db.query(sql, a);
  return ret.rowCount;
};

module.exports = docs;
