class page {

  constructor (options = {}) {
    this.fs = options.fs;
    this.si = options.siteinfo;
    this.funcs = options.funcs;
    this.path = options.path;

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
  }

  init () {
    let gjs = '';
    let gcss = '';
    try {
      gjs = this.fs.readFileSync(`${this.path}/global.js`, {encoding:'utf8'});
    } catch(err){}

    try {
      gcss = this.fs.readFileSync(`${this.path}/global.css`, {encoding:'utf8'});
    } catch (err){}
    this.pi.globalcss = gcss;
    this.pi.globaljs = gjs;
    let pages = this.fs.readdirSync(this.path+'/pages');
    this.loadpage(pages);
  }

  reload (si) {
    this.si = si;
    this.init();
  }

  resetpi () {
    this.pi.js = '';
    this.pi.header = '';
    this.css = '';
    this.main = '';
  }

  loadpage(pages) {
    for (let i=0; i<pages.length; i++) {
      this.initpage(this.path+'/pages', pages[i]);
    }
    this.page40x();
  }

  fmtpage (p) {
    var html = `<!DOCTYPE html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,height=device-height">
        <title>${this.si.title}</title>
        <link href="/theme/css/mini-dark.min.css" rel="stylesheet">
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
        <div class="container">
          <div class="row shadowed" style="padding:0.5rem;line-height:3.9rem;margin-bottom:1.1rem;">
            <div class="col-sm-2 col-md-1 col-lg-1">
            <img src="/m/image/logo.png" style="max-width:3.9rem;height:auto;" class="shadowed">
            </div>
            <div class="col-sm-10 col-md-11 col-lg-6">
              <h4 style="color:#919295;">${this.si.topinfo}</h4>
            </div>
            <div class="col-sm-12 col-md-12 col-lg-5">
              <header>
                <a href="/" class="button">首页</a>
                <a href="/lecture-list" class="button">教程</a>
              </header>
            </div>
          </div>
        </div>
        
        <div class="container" id="__main__" style="margin-top:0.6rem;">
          ${p.main}
        </div>
        <br>
        <div class="container">
          ${this.si.footer}
        </div>
        <div class="container" style="text-align:center;padding:0.5rem;">
          <div class="col-sm-1 col-md-1 col-lg-2"></div>
          <div class="col-sm-10 col-md-10 col-lg-8">
            <span style="font-size:86%;">${this.si.copyright}</span>
          </div>
          <div class="col-sm-1 col-md-1 col-lg-2"></div>
        </div>
        <br>
        <div id="sys-notify"></div>
        <div id="sys-cover"></div>
        <div id="sys-loading"></div>
        <script>
          ${p.js}
        </script>
        <script>
          function _setMainSize() {
            let d = document.getElementById('__main__');
            if (d) {
              d.style.minHeight = document.documentElement.clientHeight * 0.85 + 'px';
            }
          }
          if (typeof window.onresize === 'function') {
              let _wrz = window.onresize;
              window.onresize = function () {
                  _setMainSize();
                  _wrz();
              };
          } else {
            window.onresize = function () {
              _setMainSize();
            };
          }
          _setMainSize();
        </script>
      </body>
    </html>`;
    return html;
  }

  initpage (pdir, pname) {
    let headerfile = `${pdir}/${pname}/header.html`;
    let htmlfile = `${pdir}/${pname}/${pname}.html`;
    let cssfile = `${pdir}/${pname}/${pname}.css`;
    let jsfile = `${pdir}/${pname}/${pname}.js`;

    this.resetpi();

    try {
      this.fs.accessSync(headerfile, this.fs.constants.F_OK);
      this.pi.header = fs.readFileSync(headerfile, {encoding:'utf8'});
    } catch (err) {}

    try {
      this.fs.accessSync(htmlfile, this.fs.constants.F_OK);
      this.pi.main = this.fs.readFileSync(htmlfile, {encoding:'utf8'});
    } catch (err) {
      console.log(err);
    }

    try {
      this.fs.accessSync(cssfile, this.fs.constants.F_OK);
      this.pi.css = this.fs.readFileSync(cssfile, {encoding:'utf8'});
    } catch (err) {
      //console.log(err);
    }

    try {
      this.fs.accessSync(jsfile, this.fs.constants.F_OK);
      this.pi.js = this.fs.readFileSync(jsfile, {encoding:'utf8'});
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
        <link href="/theme/css/mini-nord.min.css" rel="stylesheet">
        ${p.header}
        <style>
          ${p.globalcss}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="row">
            <div class="col-sm-12 col-md-12 col-lg-12" style="padding:0.4rem;line-height:2.2rem;text-align:center;">
              ${p.sitename}
            </div>
          </div>
        </div>

        <div class="container" id="main">
          <div class="row">
            <div class="col-md-2 col-lg-3"></div>
            <div class="col-sm-12 col-md-8 col-lg-6" style="padding:0.6rem;">
              <h3>404 : 没有此页面，请点击回到首页</h3>
              <a href="/">首页</a>
            </div>
            <div class="col-md-2 col-lg-3"></div>
          </div>
        </div>

        <div class="container">
          ${this.si.footer}
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

module.exports = page;
