module.exports = {
  //32长度的字符
  adminkey : 'xiong-an-dao-jian-wang-luo-ke-ji',
  apidomain : 'http://localhost',
  adminapi : '/admin',
  port : 2022,
  host : '0.0.0.0',
  apikey : 'bu-xiang-shei-dou-ke-yi-diao-yong', //API调用的key,暂时没有使用,
  //IP白名单
  allowList: [
    '127.0.0.1'
  ],
  cors : [],

  //会话有效期，秒
  expires : 18000,

  useDownload : false,
  downloadPath: __dirname + '/../download',
  downloadMax: 2
};
