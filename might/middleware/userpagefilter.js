module.exports = async (c, next) => {
    c.body = c.body.replace(/<[\w\/]+[^>]*>/g, '');
    if (c.body.length > 4000) {
        c.res.body = {
            status : 1,
            errmsg : 'too large, limit 4000 bytes'
        }
        return ;
    }
    await next(c);
};