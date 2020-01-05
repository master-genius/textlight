module.exports = {
    apidomain : 'http://localhost:2021',
    domain : 'http://localhost:2021',
    port : 2021,
    host : '0.0.0.0',
    docpath: process.env.HOME + '/brave/djdoc',

    //表示用于分组的目录层级
    group: 0,

    //分组别名
    alias : {

    },

    //不需要加载的目录
    filter : [

    ],
    
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

    bodyMaxSize: 2000000,

    useLimit: true,

    cors : [
        //'https://servicewechat.com'
    ]
};
