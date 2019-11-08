module.exports = async (c, next) => {
    c.setHeader('Cache-control', 'public, max-age=1800');
    await next(c);
};