const fs = require('fs');

class apage {

  constructor (options = {}) {
    this.pi = {
      globalcss : '',
      initjs : '',
      globaljs : '',
      title : '',
      footer : '',
      topinfo : '',
      sitename : '',
      menu : '',
      js : '',
      header : '',
      css : '',
      main : ''
    };

    this.pageCache = {};

    for (let k in this.pi) {
      if (options[k] !== undefined) {
        this.pi[k] = options[k];
      }
      delete options[k];
    }

    this.path = options.path;
  }

  init (pages) {
    let gjs = '';
    let gcss = '';
    try {
      gjs = fs.readFileSync(`${this.path}/global.js`, {encoding:'utf8'});
    } catch(err){}

    try {
      gcss = fs.readFileSync(`${this.path}/global.css`, {encoding:'utf8'});
    } catch (err){}
    this.pi.globalcss = gcss;
    this.pi.globaljs = gjs;
    this.loadpage(pages);
  }

  setinfo (options) {
    for (let k in options) {
      if (this.pi[k] !== undefined) {
        this.pi[k] = options[k];
      }
    }
  }

  resetpi () {
    this.pi.js = '';
    this.pi.header = '';
    this.css = '';
    this.main = '';
  }

  loadpage(pages) {
    for (let i=0; i<pages.length; i++) {
      this.initpage(this.path, pages[i]);
    }
  }

  fmtpage (p) {
    var html = `<!DOCTYPE html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,height=device-height">
        <title>${p.title}</title>
        <link href="/static/css/foundation.min.css" rel="stylesheet">
        ${p.header}
        <style>
          ${p.globalcss}
          ${p.css}
        </style>
        <script>
        ${p.initjs}
        ${p.globaljs}
        </script>
      </head>
      <body>
        <div class="full-container">
          <div class="grid-x">
          <div class="cell small-3 medium-3 large-2" style="padding:0.4rem;line-height:2.2rem;text-align:center;background:#f1f0f5;">
            <span style="font-size:121%;color:4a4a4f;">
              <img src="/a/siteimage/logo.png" style="width:28px;height:auto;">TextLight
            </span>
          </div>
          <div class="cell small-9 medium-9 large-10" style="text-align:center;line-height:2.2rem;border-bottom:solid 0.06rem #eaeaef;padding:0.5rem;background:#afafb2;">
            ${p.topinfo}
          </div>
          </div>
        </div>
        <div class="full-container" id="main">
          <div class="grid-x">
            <div class="cell small-3 medium-3 large-2" style="border-right:solid 0.05rem #efefef;">
              <div id="admin-info" style="padding:0.2rem;"></div>
              ${p.menu}
            </div>
            <div class="cell small-9 medium-9 large-10">
              ${p.main}
            </div>
          </div>
        </div>
        <div class="full-container">
          ${p.footer}
        </div>
        <div id="sys-notify"></div>
        <div id="sys-cover"></div>
        <div id="sys-loading"></div>
        <script>
          ${p.js}
        </script>
        <script>
          function setMainSize() {
            let d = document.getElementById('main');
            if (d) {
              d.style.minHeight = document.documentElement.clientHeight * 0.85 + 'px';
            }
          }
          if (typeof window.onresize === 'function') {
              let _wrz = window.onresize;
              window.onresize = function () {
                  setMainSize();
                  _wrz();
              };
          } else {
            window.onresize = function () {
              setMainSize();
            };
          }
          setMainSize();
        </script>
      </body>
    </html>`;
    return html;
  }

  loginpage (p) {
    return `<!DOCTYPE html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,height=device-height">
        <title>${p.title}</title>
        <link href="/static/css/foundation.min.css" rel="stylesheet">
        ${p.header}
        <style>
          ${p.globalcss}
          ${p.css}
        </style>
      </head>
      <body>
        <div class="full-container">
          <div class="grid-x">
            <div class="cell small-12" style="padding:0.4rem;line-height:2.2rem;text-align:center;background:#f2f1f9;">
              ${p.sitename} - 管理员登录
            </div>
          </div>
        </div>

        <div class="full-container" id="main">
          <div class="grid-x">
            <div class="cell small-1 medium-3 large-4"></div>
            <div class="cell small-10 medium-6 large-4">
              ${p.main}
            </div>
            <div class="cell small-1 medium-3 large-4"></div>
          </div>
        </div>

        <div class="full-container">
          ${p.footer}
        </div>
        <div id="sys-notify"></div>
        <script>
          ${p.js}
        </script>
        <script>
          function setMainSize() {
            let d = document.getElementById('main');
            if (d) {
              d.style.minHeight = document.documentElement.clientHeight * 0.85 + 'px';
            }
          }
          if (typeof window.onresize === 'function') {
              let _wrz = window.onresize;
              window.onresize = function () {
                  setMainSize();
                  _wrz();
              };
          } else {
            window.onresize = function () {
              setMainSize();
            };
          }
          setMainSize();
        </script>
      </body>
    </html>`;
  }

  initpage (pdir, pname) {
    let headerfile = `${pdir}/${pname}/header.html`;
    let htmlfile = `${pdir}/${pname}/${pname}.html`;
    let cssfile = `${pdir}/${pname}/${pname}.css`;
    let jsfile = `${pdir}/${pname}/${pname}.js`;

    this.resetpi();

    try {
      fs.accessSync(headerfile, fs.constants.F_OK);
      this.pi.header = fs.readFileSync(headerfile, {encoding:'utf8'});
    } catch (err) {}

    try {
      fs.accessSync(htmlfile, fs.constants.F_OK);
      this.pi.main = fs.readFileSync(htmlfile, {encoding:'utf8'});
    } catch (err) {
      console.log(err);
    }

    try {
      fs.accessSync(cssfile, fs.constants.F_OK);
      this.pi.css = fs.readFileSync(cssfile, {encoding:'utf8'});
    } catch (err) {
      //console.log(err);
    }

    try {
      fs.accessSync(jsfile, fs.constants.F_OK);
      this.pi.js = fs.readFileSync(jsfile, {encoding:'utf8'});
    } catch (err) {
      //console.log(err);
    }
    let pdata = '';
    if (pname === 'login') {
      pdata = this.loginpage(this.pi);
    } else {
      pdata = this.fmtpage(this.pi);
    }
    this.pageCache[ pname ] = pdata.replace(/^\s+/mg,'');
    return pdata;
  }

  page40x () {
    let p = this.pi;
    let html = `<!DOCTYPE html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,height=device-height">
        <title>${p.title}</title>
        <link href="https://cdn.bootcss.com/foundation/6.5.3/css/foundation.min.css" rel="stylesheet">
        ${p.header}
        <style>
          ${p.globalcss}
        </style>
      </head>
      <body>
        <div class="full-container">
          <div class="grid-x">
            <div class="cell small-12" style="padding:0.4rem;line-height:2.2rem;text-align:center;background:#f2f1f9;">
              ${p.sitename}
            </div>
          </div>
        </div>

        <div class="full-container" id="main">
          <div class="grid-x">
            <div class="cell small-1 medium-3 large-4"></div>
            <div class="cell small-10 medium-6 large-4">
              <h3>404 : 没有此页面，请点击回到首页</h3>
              <a href="/adminpage/home">首页</a>
            </div>
            <div class="cell small-1 medium-3 large-4"></div>
          </div>
        </div>

        <div class="full-container">
          ${p.footer}
        </div>
        <div id="sys-notify"></div>
        <script>
          function setMainSize() {
            let d = document.getElementById('main');
            if (d) {
              d.style.minHeight = document.documentElement.clientHeight * 0.85 + 'px';
            }
          }
          if (typeof window.onresize === 'function') {
              let _wrz = window.onresize;
              window.onresize = function () {
                  setMainSize();
                  _wrz();
              };
          } else {
            window.onresize = function () {
              setMainSize();
            };
          }
          setMainSize();
        </script>
      </body>
    </html>`;
    this.pageCache [ '404' ] = html;
  }

  find (pname) {
    if (this.pageCache[pname] !== undefined) {
      return this.pageCache[pname];
    }
    return null;
  }

}

module.exports = apage;
