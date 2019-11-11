module.exports = async (c, next) => {    
    c.body = JSON.parse(c.body);

    let user_preg = /^[a-z][a-z0-9\-\_]{4,30}$/i;

    if (!user_preg.test(c.body.username)) {
        c.res.body = {
            status : 1,
            errmsg : '用户名格式错误'
        };
        return ;
    }

    let sql = "SELECT id FROM users WHERE username=$1";

    try {
        let ret = await c.service.pool.query(sql, [c.body.username]);
        if (ret.rowCount > 0) {
            c.res.body = {
                status : 1,
                errmsg : '用户名已存在'
            };
            return ;
        }
    } catch (err) {
        c.status(500);
        return ;
    }

    await next(c);
};