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

  __mid () {
    return [
      {
        name : 'cors',
        path : ['get']
      }
    ]
  }

}

module.exports = image;
