module.exports = async (c, next) => {
    if (!c.headers['referer']) {
        c.headers['referer'] = '';
    }

    if (c.headers['referer'].indexOf('https://servicewechat.com') == 0
        || c.headers['referer'].indexOf('https://www.w3xm.top') == 0
        || c.headers['referer'].indexOf('https://w3xm.top') == 0
        || c.headers['referer'].indexOf('https://daojian.w3xm.top') == 0
        || c.headers['referer'].indexOf('http://localhost') == 0)
    {
        await next(c);
    } else {
        c.status(404);
    }
};
