module.exports = async (c, next) => {
    let r = c.service.user.verifyToken(c.query.user_token, c.service.userkey);
    c.box.user = (r===false ? {} : r);

    if (c.method != 'GET' || c.routepath == '/user/blog/:id' || c.routepath=='/user/blog') 
    {
        if (r === false || r.ip !== c.ip) {
            c.res.body = {
                status : 10,
                errmsg : 'verify token failed'
            };
            return ;
        }
        
    }
    
    await next(c);
};
