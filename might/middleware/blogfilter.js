module.exports = async (c, next) => {
    try {
        if (c.method === 'POST') {
            let r = await c.service.pool.query(
                'SELECT COUNT(*) AS total FROM blog WHERE uid=$1', 
                [c.box.user.id]
            );
            if (r.rowCount > 0 && r.rows[0].total >= c.service.maxBlogs) {
                c.res.body = {
                    status : 1,
                    errmsg : 'max limit:' + c.service.maxBlogs
                }
                return ;
            }
        }

        if (c.headers['content-type'] !== 'text/plain') {
            c.res.body = {
                status : 1,
                errmsg : 'bad data type'
            };
            return ;
        }
        c.body = JSON.parse(c.body);
        //过滤标签
        //c.body.content = c.body.content.replace(/<[\w\/]+[^>]*>/ig, '');

        //c.body.content = c.body.content.replace(/</g, '&lt;');
        //c.body.content = c.body.content.replace(/>/g, '&gt;');

        if (c.body.content.length > 10000) {
            c.res.body = {
                status : 1,
                errmsg : 'too large,limit:10000 words'
            };
            return ;
        }
        
        c.body.name = c.body.name.replace(/\</g, '&lt;');
        c.body.name = c.body.name.replace(/\>/g, '&gt;');
        await next(c);
    } catch (err) {
        c.res.body = {
            status : 1,
            errmsg : 'bad data'
        };
    }
};
