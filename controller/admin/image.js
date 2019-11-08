const fs = require('fs');

class image {
  constructor () {

    this.param = '/*';

    this.typemap = {
      'j_'  : 'image/jpeg',
      'p_'  : 'image/png',
      'g_'  : 'image/gif',
    };

    this.typepre = {
      'image/jpeg'  : 'j_',
      'image/png'   : 'p_',
      'image/gif'   : 'g_'
    };

    this.typeext = {
      'image/jpeg'  : '.jpg',
      'image/png'   : '.png',
      'image/gif'   : '.gif'
    };

    this.extmap = {
      '.jpg' : 'image/jpeg',
      '.png' : 'image/png',
      '.gif' : 'image/gif'
    };

    this.loaded = false;
    this.imageList = {};

    //记录删除记录，在操作完成后会清空
    this.delLog = {};
  }

  loadimgdir (imgdir, cell, imgpath) {
    let flist = fs.readdirSync(imgdir, {withFileTypes:true});
    for (let i=0; i<flist.length;i++) {
      if (flist[i].isFile() && 
        this.typemap[flist[i].name.substring(0,2)] !== undefined
      ) {
        cell.push(imgpath+'/'+flist[i].name);
      }
    }
  }

  loadImages (c, all = false) {
    try {
      let cell = [];
      let imgdir = `${c.service.imagepath}`;
      let imgpath = '';
      if (all === false) {
        imgpath = `${c.box.user.id.substring(0,10)}`;
        this.loadimgdir(`${imgdir}/${imgpath}`, cell, imgpath);
        return cell;
      }

      let dlist = fs.readdirSync(imgdir, {withFileTypes:true});
      for(let i=0; i<dlist.length; i++) {
        if (!dlist[i].isDirectory()) {
          continue;
        }
        this.loadimgdir(`${c.service.imagepath}/${dlist[i].name}`, 
          cell, dlist[i].name);
      }
      return cell;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async get (c) {
    let imgfile = `${c.service.imagepath}/${c.param.starPath}`;
    let typ = c.helper.extName(c.param.starPath);
    if (this.extmap[typ] === undefined) {
      c.status(400);
      return ;
    }

    try {
      c.setHeader('content-type', this.extmap[typ]);
      c.setHeader('cache-control', 'public,max-age=25600');
      await new Promise((rv, rj) => {
        let fst = fs.createReadStream(imgfile);
        fst.pipe(c.response, {
          end: false
        });
        fst.on('end', () => {
          rv();
        });
      });
      
    } catch (err) {
      c.status(404);
    }

  }

  async list (c) {
    c.setHeader('cache-control', 'public,max-age=120');
    if (c.box.user.role === 'root' || c.box.user.role === 'super') {
      c.res.body = this.loadImages(c, true);
    } else {
      c.res.body = this.loadImages(c);
    }
  }

  /**
   * @param {*} c 
   * 因为涉及到不同用户的权限，所以对于图片的管理则不能笼统的不做区分，这样会导致管理混乱。
   * 只有root用户可以查看并管理所有图片。
   * 要区分用户很简单，只需要按照用户名或id等唯一标识进行目录创建即可，
   * 如果此用户不存在了，这些资源要有一个合理的安排，简单的、不耦合的情况就是交给root用户管理。
   */
  async create (c) {
    let imgfile = c.getFile('image');
    let imgname = `${c.service.funcs.timestr()}_${c.box.user.id.substring(0,4)}`;
    let tpre = this.typepre[ imgfile['content-type'] ];
    
    imgname = `${tpre}${imgname}${this.typeext[ imgfile['content-type'] ]}`;

    let subpath = c.box.user.id.substring(0,10);
    let imgdir = `${c.service.imagepath}/${subpath}`;
    try {
      fs.accessSync(imgdir, fs.constants.F_OK);
    } catch (err) {
      fs.mkdirSync(imgdir);
    }

    try {
        let r = await c.moveFile(imgfile, {
          filename: imgname,
          path : imgdir
        });
        c.res.body = c.service.api.ret(0, {name : imgname, path : subpath});
    } catch (err) {
        c.res.body = c.service.api.ret('EUDEF', err.message);
    }
  }

  /**
   * 删除图片的操作属于比较耗时的请求，所以采用异步处理的方式。
   * 实际并不一定会完全成功，需要前端定时请求并获取结果。
   */
  async realDeleteImages (imgpath, imgs, role, uid) {
    let ilog = {};
    for (let i=0; i<imgs.length; i++) {
      try {
        if (role !== 'root' && role !== 'super') {
          if (!this.checkUser(uid, imgs[i])) {
            ilog[imgs[i]] = 'Error: 无操作权限';
            continue;
          }
        }
        await new Promise((rv, rj) => {
          fs.unlink(`${imgpath}/${imgs[i]}`, err => {
            if (err) {
              rj(err);
            } else {
              rv();
            }
          });
        });
        ilog[imgs[i]] = 'OK';
      } catch (err) {
        ilog[imgs[i]] = 'Error: 删除失败';
      }
    }
    return ilog;
  }

  checkUser(uid, img) {
    let imgp = img.split('/').filter(p=>p.length>0);
    if (uid.indexOf(imgp[0]) != 0) {
      return false;
    }
    return true;
  }

  async delete (c) {
    let ilist = JSON.parse(c.body);
    let ilog = await this.realDeleteImages(c.service.imagepath,
          ilist, c.box.user.role, c.box.user.id);
    c.res.body = c.service.api.ret(0, ilog);
  }

  /**
   * 因为并无更新操作，但是需要一个获取删除图片记录的接口，所以使用了PUT请求
   * 此处已弃用
   */
  /* async update (c) {
    if (this.delLog[c.param.id] !== undefined) {
      c.res.body = c.service.api.ret(0, this.delLog[c.param.id]);
      delete this.delLog[c.param.id];
    } else {
      c.res.body = c.service.api.ret('ENOTFD');
    }
  } */

  __mid () {
    return [
      {
        name : 'imagefilter',
        path : ['create']
      }
    ];
  }

}

module.exports = image;
