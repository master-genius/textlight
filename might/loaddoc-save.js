const fs = require('fs');
const marked = require('marked');
const {formatTime} = require('./functions');

/**
 * 默认递归目录最高10层，只要是.md文件就会加载，
 * 默认 _ 和 . 开头的目录不加载。
 * 在markdown文件中，文件首部要使用注释来说明元信息：
 *  <!--name:[NAME]-->
 *  <!--description:[DESCRIPTION]-->
 *  <!--author:[AUTHOR]-->
 *  <!--time:[TIME]-->
 *  <!--keywords:[KEYWORDS]-->
 *  <!--headimg:[IMAGE-PATH]-->
 *  headimg涉及路径，皆以当前.md文件所在路径作为相对路径。
 *  约定如果文件名称有@，则后面是时间戳，格式为2019-10-24
 */
class loaddoc {

  constructor (options = {}) {

    this.keyFile = {}; //关键词到文件的映射
    this.fileinfo = {}; //文件到描述的映射
    this.fileData = {}; //实际文件的数据
    this.kkeys = [];

    this.groups = {};
    
    this.domain = '';
    this.total = 0;
    this.maxSize = 51200;

    /**
     * 会添加在image路径后的参数pre=
     * 主要为了在指定加载路径，此时localimage接口要根据路径去讯寻找图片导致路径错误，
     * 此时可以根据相对于docpath的路径，把这个路径作为参数传递。
     */
    this.imgpre = ''; 

    this.docpath = '';
    if (typeof options === 'string') {
      this.docpath = options;
    } else if (typeof options === 'object') {
      if (options.docpath) {
        this.docpath = options.docpath;
      }
      if (options.domain) {
        this.domain = options.domain;
      }
    }

    this.keyLecture = {};
    this.lectureList = [];
    this.lectureKey = {};
    //regex | str
    this.mode = 'regex';
    //指定按照哪一级目录作为分组。
    this.grpLevel = 0;
  }

  init (dirn) {
    this.keyFile = {};
    this.fileinfo = {};
    this.fileData = {};
    this.kkeys = [];
    this.groups = {};

    if (dirn) {
      this.loaddir(dirn, '', 0);
    } else {
      if (typeof this.docpath === 'string') {
        this.docpath = [this.docpath];
      }
      for (let i=0; i<this.docpath.length; i++) {
        this.loaddir(this.docpath[i], '', 0, i);
      }
    }

    this.kkeys = Object.keys(this.keyFile);
  }

  selfinit(dirs) {
    if (typeof dirs === 'string') {
      dirs = [dirs];
    }
    for(let i=0; i<dirs.length; i++) {
      this.loaddir(this.docpath+'/'+dirs[i], dirs[i]);
    }
    this.kkeys = Object.keys(this.keyFile);
  }

  /**
   * 
   * @param {string} pdir 目录
   * @param {number} deep 深度，这不需要自己传递，由程序控制
   */
  loaddir (pdir, pkg='', deep=0, ind=0) {
    if (deep > 10) {
      return ;
    }
    try {
      let dlist = fs.readdirSync(pdir, {withFileTypes: true});
      let kid = '';
      for (let i=0; i<dlist.length; i++) {
        if (dlist[i].name[0] == '_' 
          || dlist[i].name[0] == '.' 
          || (deep=0 && dlist[i].name == 'RAEDME.md'))
        {
          continue;
        }
        if (dlist[i].isDirectory()) {
          kid = `${pkg}${pkg===''?'':'/'}${dlist[i].name}`;
          this.loaddir(`${pdir}/${dlist[i].name}`, kid, deep+1);
        } else if (dlist[i].isFile()) {
          this.loaddoc(pdir, pkg, dlist[i].name, ind);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  loaddoc (pdir, pkg, pname, ind) {
    if (pname.length < 4 || pname.substring(pname.length - 3) !== '.md') {
      return ;
    }
    try {
      let fst = fs.statSync(`${pdir}/${pname}`);
      if (fst.size > this.maxSize) {
        console.log('文件太大');
        return ;
      }
      let fname = `${pdir}/${pname}`; //实际目录
      
      let data = fs.readFileSync(fname, {encoding: 'utf8'});
      this.parsedoc(data, pkg, pname.substring(0, pname.length-3), ind);
    } catch (err) {
      console.log(err);
    }
  }

  parsedoc (data, pkgdir, pname, ind) {
    let di = {
      name : pname,
      description: '',
      keywords: '',
      author: '',
      time : '',
      headimg : ''
    };
    let tmp = '';
    let r = null;
    let lastind = 0;
    for (var k in di ) {
      r = new RegExp(`^<\!--${k}:.*-->$`, 'im');
      tmp = data.match(r);
      if (tmp === null) {
        continue;
      }
      lastind = tmp.index + tmp[0].length;
      di[k] = tmp[0].substring(5+k.length, tmp[0].length-3).trim();
    }
    if (lastind > 0) {
      data = data.substring(lastind).trim();
    }
    di.id = `${pkgdir}${pkgdir=='' ? '' : '/'}${pname}${ind}`;
    if (data.length == 0) {
      return ;
    }
    if (di.headimg.length > 0) {
      di.headimg = `${pkgdir}${pkgdir=='' ? '' : '/'}${di.headimg}`;
    }
    if (di.time === 'now') {
      di.time = formatTime(null, true);
    }
    let kstr = `${di.id}:${di.name == pname ? '' : di.name}:${di.keywords.substring(0, 24)}`;
    this.fileinfo[di.id] = di;
    this.keyFile[kstr] = di.id; //直接索引
    //第一层目录作为分组
    if (di.id.indexOf('/') > 0) {
      let grp = di.id.split('/')[0];
      if (this.groups[grp] === undefined) {
        this.groups[grp] = [];
      }
      this.groups[grp].push(kstr);
    }
    
    this.fileData[di.id] = this.markdata(data, pkgdir);
    this.total += 1;
  }

  markdata (mdata, pkgdir) {
    //mdata = mdata.replace(/^\n$/g, '<br>');
    mdata = this.replaceImageSrc(mdata, pkgdir);
    let htmldata = marked(mdata, {breaks:true, gfm: true});
    htmldata = this.setImageStyle(htmldata);
    htmldata = htmldata.replace(/\<p\>/ig, '<p style="margin-top:0.2rem;margin-bottom:0.2rem;">');
    htmldata = htmldata.replace(/<\/pre>/ig, '</pre><br>');
    //htmldata = htmldata.replace(/^\n$/mg, '<br>');
    return htmldata;
  }

  parseCond(cstr) {
    return new RegExp(cstr, 'i');
  }

  resetImgSrc (data, imgsrc, pkgdir) {
    let realsrc = '';
    if (imgsrc[0] == '/') {
      imgsrc = imgsrc.substring(1);
    }
    realsrc = this.domain + '/localimage/' + pkgdir + '/' + imgsrc;
    if (this.imgpre.length > 0) {
      realsrc += '?pre=' + this.imgpre;
    }

    let i = 0;
    while ( data.indexOf(`](${imgsrc}`) >= 0  && i < 30) {
      data = data.replace(imgsrc, realsrc);
      i+=1;
    }
    return data;
  }

  replaceImageSrc (data, pkgdir) {
    var images = data.match(/\!\[[^\]]*\]\(.*\)/ig);
    
    if (!images) {
      return data;
    }
    let tmp = '';
    for(let i=0; i<images.length; i++) {
      tmp = images[i].split('](')[1];
      data = this.resetImgSrc(data, tmp.substring(0, tmp.length-1), pkgdir);
    }
    return data;
  }

  setImageStyle (html) {
    return html.replace(/\<img /ig, '<img style="width:auto;height:auto;max-width:100%;" ');
  }

  getById (id) {
    if (this.fileinfo[id]) {
        let r = this.fileinfo[id];
        return {
          time : r.time,
          author: r.author,
          name: r.name,
          description: r.description,
          data: this.fileData[id]
        };
    }
    return null;
  }

  get (cstr, offset = 0) {
      let r = this.search(cstr, 1, offset);
      if (r.length > 0) {
          return {
            time : r[0].time,
            author: r[0].author,
            name: r[0].name,
            description: r[0].description,
            data: this.fileData[r[0].id]
          };
      }
      return null;
  }

  select (cstr, limit = 0, offset = 0, group=null, withData = false) {
      if (withData) {
          let ret = this.search(cstr, limit, offset, group);
          for (let i=0; i<ret.length; i++) {
              ret[i].data = this.fileData[ret[i].id];
          }
          return ret;
      }
      return this.search(cstr, limit, offset, group);
  }

  count (cstr, group = null) {
    let preg = this.parseCond(cstr);
    let total = 0;
    let grpkeys = this.kkeys;
    if (group !== null) {
      if (this.groups[group] === undefined) {
        return 0;
      }
      grpkeys = this.groups[group];
    }
    for (let i=0; i<grpkeys.length; i++) {
      if ( preg.test(grpkeys[i]) ) {
        if (group && this.keyFile[ grpkeys[i] ].indexOf(group) !== 0) {
          continue;
        }
        total += 1;
      }
    }
    return total;
  }

  search (cstr, limit = 0, offset = 0, group = null) {
    let preg = this.parseCond(cstr);
    let result = [];
    let count = 0;
    let start = 0;
    let tmp = '';
    let grpkeys = this.kkeys;
    if (group !== null) {
      if (this.groups[group] === undefined) {
        return [];
      }
      grpkeys = this.groups[group];
    }

    for (let i=0; i<grpkeys.length; i++) {
      if ( preg.test(grpkeys[i]) ) {
        
        tmp = this.fileinfo[ this.keyFile[ grpkeys[i] ] ];
        start += 1;
        if (start > offset) {
            if (limit == 0) {
                count += 1;
                result.push({
                    time : tmp.time,
                    id: tmp.id,
                    author: tmp.author,
                    name: tmp.name,
                    description: tmp.description,
                    headimg : tmp.headimg
                });
            } else if (limit > 0) {
                if (count < limit) {
                    count += 1;
                    result.push({
                        time : tmp.time,
                        id: tmp.id,
                        author: tmp.author,
                        name: tmp.name,
                        description: tmp.description,
                        headimg : tmp.headimg
                    });
                } else {
                    return result;
                }
            }
        }
      }
    }

    return result;
  }

  resetLecture () {
    this.keyLecture = {};
    this.lectureList = [];
    this.lectureKey = {};
  }

  initLecture (lpath = '') {
      let lecpath = lpath  + '/_lecture';
      let lecjson = lecpath + '/@lecture.json';
      let lecList = '';
      try {
          fs.accessSync(lecpath, fs.constants.F_OK);
          fs.accessSync(lecjson, fs.constants.F_OK);
          lecList = JSON.parse(fs.readFileSync(lecjson));
      } catch (err) {
          console.log(err);
          return false;
      }

      if (!lecList.list || typeof lecList.list !== 'object') {
          return false;
      }
      
      for (let i=0; i < lecList.list.length; i++) {
          this.loadLecture(lecpath + '/' + lecList.list[i]+'.json',
                  lecList.list[i], lpath || this.docpath);
      }

  }

  lectures () {
      return this.lectureList;
  }

  getLec (cstr, offset = 0) {
      var r = this.searchLec(cstr, 1, offset);
      if (r.length == 0) {
          return null;
      }
      return r[0];
  }

  getLecById(lecid) {
      if (this.lectureKey[lecid]) {
          return this.lectureKey[lecid];
      }
      return null;
  }

  selectLec (cstr, limit = 10, offset = 0) {
      return this.searchLec(cstr, limit, offset);
  }

  searchLec (cstr, limit = 0, offset = 0) {
      let preg = this.parseCond(cstr);
      let result = [];
      let tmp = '';
      let start = 0;
      let count = 0;
      for (let k in this.keyLecture) {
          if (!preg.test(k)) { continue; }

          tmp = this.lectureKey[ this.keyLecture[k] ];
          start += 1;
          if (start <= offset) {continue;}
          if (limit <= 0) {
              result.push({
                  id : tmp.id,
                  name : tmp.name,
                  description: tmp.description,
                  author: tmp.author,
                  list : tmp.list,
                  image : tmp.image
              });
          } else {
              if (count < limit) {
                  count += 1;
                  result.push({
                      id: tmp.id,
                      author: tmp.author,
                      name: tmp.name,
                      description: tmp.description,
                      list : tmp.list,
                      image : tmp.image
                  });
              } else {
                  return result;
              }
          }
      }

      return result;
  }

  loadLecture (lecfile, leckey, lpath = '') {
      if (lpath === '') {
        lpath = this.docpath;
      }
      let lecdata = '';
      try {
          fs.accessSync(lecfile, fs.constants.F_OK);
          lecdata = JSON.parse(fs.readFileSync(lecfile));
      } catch (err) {
          console.log(err);
          return false;
      }

      if (!lecdata.name || lecdata.name.trim() == '') {
          return false;
      }

      if (!lecdata.image) {
          lecdata.image = '';
      } else {
          lecdata.image = this.domain + '/localimage/' + lecdata.image;
      }
      
      let lecobj = {
          id : leckey,
          name: lecdata.name.trim(),
          list: [],
          author: lecdata.author || 'BraveWang',
          description: lecdata.description,
          image : lecdata.image
      };

      let files = null;
      let lecpkgnames = [];
      if (lecdata.listdir) {
          try {
              files = fs.readdirSync(
                          lpath+'/'+lecdata.listdir,
                          {withFileTypes:true}
                      );
              for(let i=0; i<files.length; i++) {
                  if (!files[i].isFile()) { continue; }
                  if (files[i].name.substring(files[i].name.length-3) !== '.md') {
                    continue;
                  }
                  lecpkgnames.push(lecdata.listdir + '/' + files[i].name.substring(0, files[i].name.length-3));
              }
          } catch (err) {
              console.log(err);
              return false;
          }
      } else if (lecdata.list) {
          lecpkgnames = lecdata.list;
      } else {
          return false;
      }
      lecpkgnames.sort((a, b) => {
          if (a > b) {return 1; }
          if (a < b) {return -1; }
          return 0;
      });

      for (let i=0; i<lecpkgnames.length; i++) {
          if (lecpkgnames[i][lecpkgnames[i].length - 1] == '/') {
              lecpkgnames[i] = lecpkgnames[i].substring(0, 
                                  lecpkgnames[i].length - 1);
          }
          if (this.fileinfo[lecpkgnames[i]]) {
              lecobj.list.push({
                  name: this.fileinfo[lecpkgnames[i]].name,
                  id : lecpkgnames[i]
              });
          }
      }

      this.lectureKey[leckey] = lecobj;
      this.lectureList.push({
          name : lecdata.name,
          id : leckey,
          author: lecdata.author,
          description: lecdata.description,
          image : lecdata.image
      });

      this.keyLecture[leckey+lecdata.name] = leckey;
  }

}

module.exports = loaddoc;
