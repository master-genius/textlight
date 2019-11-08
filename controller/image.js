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
  }

  loadimgdir (imgdir, cell) {
    let flist = fs.readdirSync(imgdir, {withFileTypes:true});
    for (let i=0; i<flist.length;i++) {
      if (flist[i].isFile() && 
        this.typemap[flist[i].name.substring(0,2)] !== undefined
      ) {
        cell.push(flist[i].name);
      }
    }
  }

  loadImages (c, all = false) {
    try {
      let cell = [];
      let imgdir = `${c.service.imagepath}`;
      if (all === false) {
        imgdir += `/${c.box.user.id.substring(0,8)}`;
        this.loadimgdir(imgdir, cell);
        return cell;
      }

      let dlist = fs.readFileSync(imgdir, {withFileTypes:true});
      for(let i=0; i<dlist.length; i++) {
        if (!dlist[i].isDirectory()) {
          continue;
        }
        this.loadimgdir(`${c.service.imagepath}/${dlist[i].name}`, cell);
      }
      return cell;
    } catch (err) {
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
    if (c.box.user.role === 'root') {
      c.res.body = this.loadImages(c, true);
    } else {
      c.res.body = this.loadImages(c);
    }
  }

}

module.exports = image;
