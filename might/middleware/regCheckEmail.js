module.exports = async (c, next) => {
    let email_preg = /^[a-z1-9][a-z0-9\-\_]{4,30}\@[\w\d\.]+$/i;
    if (c.query.email === undefined || !email_preg.test(c.query.email)) {
        c.res.body = {
            status: 1,
            errmsg: 'email wrong'
        };
        return;
    }

    let dbp = c.service.pool;

    let ret = await dbp.query('SELECT id,username,email FROM users WHERE email=$1', 
                [c.query.email]);

    if (ret.rowCount > 0) {
        c.res.body = {
            status: 1,
            errmsg: 'email registered'
        };
        return ;
    }
    await next(c);
};
