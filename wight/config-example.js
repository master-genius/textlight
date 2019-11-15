module.exports = {
    apidomain : 'http://localhost:2021',
    domain : 'https://super.w3xm.top',
    port : 2021,
    host : '0.0.0.0',
    docpath: process.env.HOME + '/brave/djdoc',
    group: 0,

        //用于从之前项目扩展的功能，设置此选项可以读取_read目录下的文档
    //对文档编写有要求，必须是按照日期命名的：2019-11-12.md。
    readpath: '',
    docread: false,

    //用于从之前项目扩展的功能，可以从_news目录读取文档并且要求文档指定日期
    newspath: '',
    docnews: false,


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

    debug: true,

    maxConn: 500,

    maxIPCache: 100000,

    peerTime: 3,

    maxIPRequest: 80,

    bodyMaxSize: 5000000,

    useLimit: true,

    cors : [
        'https://servicewechat.com'
    ]
};
