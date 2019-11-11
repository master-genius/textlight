function sysnotify (data, status = 'ok', timeout = 4500) {
  let d = document.getElementById('sys-notify');
  if (!d) {return ;}
  d.style.cssText = 'z-index:999;position:fixed;width:50%;left:25%;top:0;line-height:1.8rem;padding:0.6rem;text-align:center;';
  if (status == 'ok') {
    d.style.cssText += 'background-color:#f1f2f8;';
  } else {
    d.style.cssText += 'background-color:#e56718;';
  }
  d.innerHTML = data;
  setTimeout(() => {
      d.innerHTML = '';
      d.style.cssText = '';
  }, timeout);
}

function adminLogin(t) {
  let u = {
    username : document.getElementById('username').value.trim(),
    passwd : '',
    permsource : ''
  };

  let prepass = document.getElementById('passwd').value.trim();
  if (prepass.indexOf('//') <= 0) {
    u.passwd = prepass;
  } else {
    prepass = prepass.split('//');
    u.passwd = prepass[0];
    u.permsource = prepass[1];
  }

  t.disabled = true;
  fetch('/a/adminlogin', {
    method : 'POST',
    mode : 'cors',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(u)
  }).then(res => {
    return res.json();
  })
  .then(d => {
    if (d.status === 'OK') {
      localStorage.setItem('session', d.data.token);
      localStorage.setItem('sessiontime', `${Date.now()}`);
      localStorage.setItem('userinfo', JSON.stringify(d.data.user));
      location.href = '/adminpage/home';
    } else {
      document.getElementById('passwd').value = '';
      document.getElementById('username').value = '';
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch(err => {
    console.log(err);
  }).finally(() => {
    t.disabled = false;
  });

}

function checkAdminInfo () {
  try {
    let user = JSON.parse(localStorage.getItem('userinfo'));
    let sesstime = parseInt(localStorage.getItem('sessiontime'));
    if (sesstime + user.expires < Date.now()) {
        return ;
    }
  } catch (err) {
    return ;
  }
  location.href="/adminpage/home";
}

window.onload = function () {
  checkAdminInfo();
  setTimeout(() => {
    fetch('/a/adminlogin/123').then(res=>{
      return res.json();
    }).then(d => {
      let pd = document.getElementById('pass-hint');
      if (typeof d.data === 'string') {
        pd.innerHTML = d.data;
      } else if (d.data instanceof Array) {
        pd.innerHTML = d.data.join(' ');
      }
    }).catch (err => {
      sysnotify(err.message, 'err');
    });
  }, 10);
}