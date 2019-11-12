module.exports = {
    apidomain : 'http://localhost:2021',
    domain : 'https://super.w3xm.top',
    port : 2021,
    host : '0.0.0.0',
    docpath: process.env.HOME + '/brave/djdoc',
    group: 0,

    siteinfo : {
        title : '深奥的简洁',
        sitename : '',
        copyright: '&copy; 道简网络科技',
        footer : '',
        topinfo: '避免一切肤浅，穿透一切复杂',
        theme : 'mdoc'
    },
    theme : 'mdoc',

    logger: false,
    loggerRoutes : [
        '/mapi/query/*',
        '/:name',
        '/',
    ],
    loggerCacheCount: 50,
};
