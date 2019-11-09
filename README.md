## TextLight 内容管理系统

TextLight是基于NodeJS开发的内容管理系统（Content Management System）。前后端全部使用JS完成，依靠NodeJS高效的异步IO可以大大提升执行效率，提高网站可以支撑的并发量。

<br>

### 环境要求

* Node.js 10 以上版本，推荐Node.js 12.13+

* PostgreSQL数据库10以上版本

* Nginx(非必须，如果要开启反向代理，可以使用Nginx)

* Linux（推荐Ubuntu、Debian、CentOS）

<br>

如果你要对比其他类似的CMS，TextLight是对环境要求依赖最低的。因为Node.js发布的编译好的程序是采用了静态编译，不会再需要安装其他底层库的依赖，直接可用，Node.js方面的第三方扩展可以直接使用自带的npm直接获取。

<br>

Nginx是非必须的，因为Node.js自带的http/https和http2模块已经就是非常高效的Web服务器。TextLight采用的tibit框架本身就支持通过配置切换HTTP协议版本，支持HTTP/1.1和HTTP/2，并且由于Node.js已经做好了基础模块，开启HTTPS也非常方便。


TextLight采用的titbit框架本身就支持限制请求数量，不过在限制请求量以及单个IP的请求量，还是推荐使用Nginx，这方面Nginx做起来更好。

<br>

采用PostgreSQL数据库是因为它更加轻量和高效，并且安装部署方便，不容易出错。

<br>


