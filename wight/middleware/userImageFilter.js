module.exports = async (c, next) => {
    let sql = "SELECT COUNT(*) as total, SUM(media_size) as total_size FROM media WHERE uid=$1";
    let ret = await c.service.pool.query(sql, [c.box.user.id]);

    if (ret.rowCount <= 0) {
        /* c.res.body = {
            status : 1,
            errmsg : 'failed'
        };return ; */
    } else {
        if (ret.rows[0].total > 0) {
            if (ret.rows[0].media_size >= c.service.userMaxMediaSize) {
                c.res.body = {
                    status : 1,
                    errmsg : 'out of limit: 120000000bytes'
                };
                return ;
            }
        }
    }

    await next(c);
};