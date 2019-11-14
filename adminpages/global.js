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

function timeOutInfo(nd, text, timeout = 4500) {
  if (typeof nd === 'string') {
      var d = document.querySelector(nd);
      if (d) {
          d.innerHTML = text;
          setTimeout(function(){
              d.innerHTML = '';
          }, timeout);
      }
  } else if (typeof nd === 'object') {
      nd.innerHTML = text;
      setTimeout(function(){
          nd.innerHTML = '';
      }, timeout);
  }
}

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
  return fetch (_apidomain+ _adminapi + path, options)
          .then(res => {
              if (options.dataType && options.dateType !== 'json') {
                  return res.text();
              }
              return res.json();
          }, err => {
              throw err;
          });
}

async function updateToken() {
    let token = localStorage.getItem('session');
    let u = JSON.parse(localStorage.getItem('userinfo'));
    let aurl = '/user/updatetoken?user_token='+token;
    return apiCall(aurl, {
        method : 'PUT',
        headers : {
            'content-type' : 'text/plain'
        },
        body : u.username
    }).then(d => {
        if (d.status == 0) {
            localStorage.setItem('sessiontime', `${Date.now()}`);
            localStorage.setItem('session', d.token);
        }
    }).catch (err => {});
}

async function userApiCall (path, options = {}) {
    let token = localStorage.getItem('session');
    if (token === null || token === '') {
        location.href = '/adminpage/login';
        return ;
    }
    let q = '?';
    if (path.indexOf('?') > 0) {
        q = '&';
    }
    path += q+'token='+token;

    return apiCall(path, options).then(d => {
        if (typeof d === 'object' && d.status == 'ENOTLOGIN') {
          location.href = '/adminpage/login';
          logout();
          return ;
        } else {
            let u = JSON.parse(localStorage.getItem('userinfo'));
            let st = parseInt(localStorage.getItem('sessiontime'));
            if (st + u.expires - 60000 <= Date.now()) {
                //updateToken();
            }
        }
        return d;
    });
}

function sysnotify (data, status = 'ok', timeout = 4500) {
  let d = document.getElementById('sys-notify');
  if (!d) {return ;}
  d.style.cssText = 'z-index:999;position:fixed;width:50%;left:25%;top:0;line-height:1.8rem;padding:0.6rem;text-align:center;';
  if (status == 'ok') {
    d.style.cssText += 'background-color:#efeff2;';
  } else {
    d.style.cssText += 'background-color:#ea6718;';
  }
  d.innerHTML = data;
  setTimeout(() => {
    d.innerHTML = '';
    d.style.cssText = '';
  }, timeout);
}

function syscover (data, back = 'background-color:#fefeff;') {
  let d = document.getElementById('sys-cover');
  if (!d) {return ;}
  d.style.cssText = `z-index:99;position:fixed;width:100%;height:100%;top:0;left:0;overflow:auto;${back}`;
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
        nd[i].style.cssText = 'background-color:#95a1b9;font-weight:bold;';
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

var _user = {};

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('userinfo'));
  } catch (err){
    return null;
  }
}

function setAdminInfo () {
  try {
    var user = JSON.parse(localStorage.getItem('userinfo'));
    let sesstime = parseInt(localStorage.getItem('sessiontime'));
    if (sesstime + user.expires < Date.now()) {
      logout();
      return ;
    }
  } catch (err) {
    logout();
    return ;
  }
  _user = user;
  var ud = document.getElementById('admin-info');
  if (localStorage.getItem('session')) {
    ud.innerHTML = `<div style="border:solid 0.05rem #eae7e9;text-align:center;padding:0.5rem;">
        <p>${user.username}</p>
        <p>
          <a href="javascript:logout();" style="font-size:90%;color:#562334;">
            退出</a>
        </p></div>`;
  } else {
    location.href="/adminpage/login";
  }
}

function logout() {
    localStorage.removeItem('session');
    localStorage.removeItem('userinfo');
    localStorage.removeItem('sessiontime')
    location.href="/adminpage/login";
}

function roleMenu(m) {
  let role = _user.role;
  if (role === 'root') { return false; }

  if (m.href.indexOf('/adminpage/admin') > 0) {
    m.style.cssText = 'display:none';
    return true;
  }

  if (role === 'super') {
    return false;
  }
  if (m.href.indexOf('/adminpage/site') > 0) {
    m.style.cssText = 'display:none';
    return true;
  }

  return false;
}

window.onpageshow = function () {
    setAdminInfo();
    let nd = document.querySelectorAll('.admin-menu');
    for(let i=0; i<nd.length; i++) {
      if (location.href.indexOf(nd[i].href) >= 0) {
        nd[i].style.cssText = 'background-color:#c2c9d2;font-weight:bold;';
      } else {
        nd[i].style.cssText = '';
      }
      roleMenu(nd[i]);
    }
};