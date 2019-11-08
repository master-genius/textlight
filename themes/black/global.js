var wo = new function() {

  this.set = function(key,val, json_seri=false) {
      if (json_seri) {
          sessionStorage.setItem(key,JSON.stringify(val));
      } else {
          sessionStorage.setItem(key, val);
      }
  };

  this.get = function(key, json_seri=false) {
      if (sessionStorage.getItem(key)===null) {
          return null;
      }
      if (json_seri) {
          return JSON.parse(sessionStorage.getItem(key));
      } else {
          return sessionStorage.getItem(key);        
      }
  };

  this.clear = function() {
      sessionStorage.clear();
  };

  this.remove = function (key) {
      sessionStorage.removeItem(key);
  };

  this.has = function (key) {
      if (sessionStorage.getItem(key) === null) {
          return false;
      }
      return true;
  }

};

function formatTime(fmtstr = '', tim = null) {
  var tm = (tim===null) ? new Date() : new Date(tim);

  fstr = fmtstr.toLowerCase();
  var join_char = '-';
  if (fstr.indexOf('.') >= 0) {
      join_char = '.';
  }

  var default_time = `${tm.getFullYear()}${join_char}${tm.getMonth()+1}${join_char}${tm.getDate()}`;

  switch (fstr) {
    case 'y-m-d':
    case 'y.m.d':
      return default_time;

    case 'y-m-d-h':
    case 'y.m.d.h':
      return `${default_time}${join_char}${tm.getHours()}`;

    case 'y-m-d h:m:s':
      return `${default_time} ${tm.getHours()}:${tm.getMinutes()}:${tm.getSeconds()}`;
    
    case 'y-m-d-h_m_s':
      return `${default_time}-${tm.getHours()}_${tm.getMinutes()}_${tm.getSeconds()}`;

    default:
      return default_time;
  }

}

async function apiCall (path, options = {}) {
  return fetch (path, options)
        .then(res => {
            if (options.dataType && options.dateType !== 'json') {
                return res.text();
            }
            return res.json();
        }, err => {
            throw err;
        });
}

function sysnotify (data, status = 'ok', timeout = 4500) {
  let d = document.getElementById('sys-notify');
  if (!d) {return ;}
  d.style.cssText = 'z-index:999;position:fixed;width:50%;left:25%;top:0;line-height:1.8rem;padding:0.6rem;text-align:center;';
  if (status == 'ok') {
    d.style.cssText += 'background-color:#efeafd;';
  } else {
    d.style.cssText += 'background-color:#e56718;';
  }
  d.innerHTML = data;
  setTimeout(() => {
      d.innerHTML = '';
      d.style.cssText = '';
  }, timeout);
}

function syscover (data) {
  let d = document.getElementById('sys-cover');
  if (!d) {return ;}
  d.style.cssText = 'z-index:99;position:fixed;width:100%;height:100%;background-color:#fefeff;top:0;left:0;overflow:auto;';
  d.innerHTML = data;
  document.body.style.overflow = 'hidden';
}

function unsyscover () {
  let d = document.getElementById('sys-cover');
  if (!d) {return ;}
  d.innerHTML = '';
  d.style.cssText = '';
  document.body.style.overflow = '';
}

var _dm = new function () {
  var self = this;
  this.selectList = function (qstr, t, callback) {
    let nd = document.querySelectorAll(qstr);
    if (!nd) {return ;}
    for (let i=0; i<nd.length; i++) {
      if (callback(nd[i], t)) {
        nd[i].style.cssText = 'background-color:#a5a2b9;font-weight:bold;';
      } else {
        nd[i].style.cssText = '';
      }
    }
  };

  this.getSelect = function(qstr, reverse = false, attr = null) {
    let stat = !reverse;
    var tmpcell = [];
    let nds = document.querySelectorAll(qstr);
    for (let i=0;i<nds.length; i++) {
      if (nds[i].checked === stat) {
        if (attr !== null) {
          tmpcell.push(nds[i][attr]);
        } else {
          tmpcell.push(nds[i]);
        }
      }
    }
    return tmpcell;
  };

  this.selected = function (qstr, val = null, html = false) {
    let nd = document.querySelector(qstr);
    if (!nd) {return;}
    if (val === null || val === undefined) {
      let r = nd.options[nd.selectedIndex];
      return {
        value : r.value,
        html : r.innerHTML
      };
    } else {
      let tmp = '';
      for (let i=0; i < nd.options.length; i++) {
        tmp = html ? nd.options[i].innerHTML : nd.options[i].value;
        if (tmp == val) {
          nd.options[i].selected = true;
          return i;
        }
      }
    }
  };
  this.loadingInterVal = null;
  this.loadingText = [
    '&nbsp;&nbsp; . &nbsp;&nbsp;&nbsp; . &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.',
    '&nbsp;&nbsp;&nbsp;&nbsp; . &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .',
    '&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .',
    '.&nbsp;&nbsp;.'
  ];
  this.loading = function () {
    let d = document.getElementById('sys-loading');
    if (!d) {return ;}
    d.style.cssText = 'z-index:1000;position:fixed;top:18%;width:50%;left:45%;font-weight:bold;text-shadow:0.2rem 0.2rem #e9e9e9;';
    d.innerHTML = '. . .';
    var ind = 0;
    self.loadingInterVal = setInterval(() => {
      ind += 1;
      if (ind >= self.loadingText.length) {
        ind = 0;
      }
      d.innerHTML = self.loadingText[ind];
    }, 350);
  };
  
  this.unloading = function () {
    let d = document.getElementById('sys-loading');
    if (!d) {return ;}
    clearInterval(self.loadingInterVal);
    d.innerHTML = '';
    d.style.cssText = '';
  };

  this.renderList = function (m, dl, tempcall, attach = false) {
    let html = '';
    try {
      for(let i=0; i<dl.length; i++) {
        html += tempcall(dl[i]);
      }
      if (attach) {
        m.innerHTML += html;
      } else {
        m.innerHTML = html;
      }
    } catch (err) {
      return false;
    }
    
  }
};

function renderMenu (ml) {
  let d = document.getElementById('menu');
  if (!d) {return ;}
  ml.sort((a, b) => {
    if (a.keywords == b.keywords) {
      return 0;
    }
    return (a.keywords > b.keywords) ? 1 : -1;
  });
  
  _dm.renderList(d, ml, (m) => {
    return `<a href="/page/show?id=${m.id}" class="button">${m.title}</a>`;
  }, true);
}

window.onpageshow = function () {
  apiCall('/api/content?type=company').then(d => {
    if (d.status == 'OK') {
      renderMenu(d.data);
    } else{
      sysnotify(d.errmsg, 'err');
    }
  });
};
