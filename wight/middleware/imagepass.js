module.exports = async (c, next) => {
    if (!c.headers['referer']) {
        c.headers['referer'] = '';
    }

    if (c.headers['referer'].indexOf(c.service.apidomain) == 0) {
        await next(c);
    } else {
        c.status(404);
    }
};
