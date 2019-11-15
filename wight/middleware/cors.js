module.exports = async (c, next) => {
    if (!c.headers['referer']) {
        c.headers['referer'] = '';
    }

    var stat = false;
    
    for (let i=0; i < c.service.cors.length && i < 5; i++) {
        if (c.headers['referer'].indexOf(c.service.cors[i]) == 0) {
            stat = true;
            break;
        }
    }

    if (stat) {
        c.setHeader('Access-control-allow-origin', '*');
        c.setHeader('Access-control-allow-methods', 
            ['GET','POST','PUT','DELETE','OPTIONS']
        );
        c.setHeader('Access-Control-Allow-Headers', 'content-type');
        await next(c);
    } else {
        c.status(404);
    }
};