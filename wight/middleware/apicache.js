module.exports = async (c, next) => {
    c.setHeader('Cache-control', 'public, max-age=3600');
    await next(c);
};