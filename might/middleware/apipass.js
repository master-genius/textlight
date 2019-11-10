module.exports = async (c, next) => {
    c.res.body = {
        status: 4003,
        errmsg: 'permission deny'
    };
    if (c.query.pass) {
        if (c.query.pass !== 'linuslinux') {      
            return ;
        }
    } else if (c.query.token && c.query.key) {
        let h = c.service.crypto.createHash('md5');
        h.update(c.query.key + 'linuslinux');
        if (h.digest('hex') !== c.query.token) {
            return ;
        }
    } else {
        return ;
    }
    await next(c);
};

/* module.exports = async (c, next) => {
    if (!c.query.pass || c.query.pass !== 'linuslinux') {
        c.res.body = {
            status: 4003,
            errmsg: 'permission deny'
        };
        return ;
    }
    await next(c);
};
 */