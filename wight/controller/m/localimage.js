const fs = require('fs');

class localimage {

    constructor () {
        this.imageCache = {};
        this.mode = 'restful';
        this.param = '/*';
        this.imageCount = 0;
    }

    async get (c) {
        let prepath = c.query.pre || '';
        let imgfile = `${c.service.docpath}${prepath}/${decodeURIComponent(c.param.starPath)}`;
        try {
            fs.accessSync(imgfile, fs.constants.F_OK);
        } catch (err) {
            c.status(404);
            return ;
        }
    
        c.setHeader('Cache-control', 'public, max-age=86400');
        c.res.encoding = 'binary';
    
        if (this.imageCache[imgfile]) {
            c.setHeader('content-type', this.imageCache[imgfile]['content-type']);
            c.setHeader('content-length', this.imageCache[imgfile]['content-length']);
            c.res.body = this.imageCache[imgfile]['data'];
            return ;
        }
    
        try {
            let funcs = c.service.funcs;
            c.res.body = await funcs.readFile(imgfile, 'binary');
            var content_type = funcs.getContentType(c.helper.extName(c.param.starPath));
            if (content_type.length > 0) {
                c.setHeader('content-type', content_type);
            }
            c.setHeader('content-length', c.res.body.length);

            if (this.imageCount > 600) {
                this.imageCache = {};
                this.imageCount = 0;
            } else {
                this.imageCount += 1;
                this.imageCache[imgfile] = {
                    'content-type' : content_type,
                    data : c.res.body,
                    'content-length' : c.res.body.length
                };
            }
            
        } catch (err) {
            //console.log(err);
            c.status(404);
        }
    }

    /* __mid () {
        return [
            {
                name : 'imagepass',
                path : ['get'],
            }
        ];
    } */

}

module.exports = localimage;
