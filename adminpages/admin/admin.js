var user_preg = /^[a-z][a-z0-9\-\_]{4,30}$/i;
var email_preg = /^[a-z1-9][a-z0-9\-\_]{3,42}\@[\w\d\.]+$/i;
var pass_preg = /^[a-z0-9\-\_\.\!\@\#\$\%\^\&\*]{7,20}$/i;
var weak_preg1 = /^[a-z0-9]{7,20}$/i;
var weak_preg2 = /^[0-9]{7,20}$/i;
var _adm = document.getElementById('admin-list');
var _adminList = [];

function adminTemp(d, u) {
  let op = `<a href="javascript:showSetPasswd('${d.username}');">安全设置</a>
  &nbsp;&nbsp;
  <a href="javascript:showEditAdmin('${d.username}');">编辑</a> &nbsp; &nbsp;
  <a href="javascript:deleteAdmin('${d.id}');" style="color:#491810;">删除</a>`;
  if (d.username === u.username) {
    op = '<p class="help-text">[当前用户]</p>';
  }
  return `<div class="cell small-12 medium-6 large-4" style="padding:0.2rem;">
    <div style="line-height:0.2rem;border-top:solid 0.2rem #af4567;width:90%;"></div>
    <p>用户名：${d.username}</p>
    <p>角色：${d.role}</p>
    <p>邮箱：${d.email}</p>
    <p>登录：${d.forbid ? '拒绝' : '允许'}</p>
    <p>
      ${op}
    </p>
  </div>`;
}

function renderAdminList (dl) {
  let u = getUser();
  let html = '';
  for(let k in dl) {
    html += adminTemp(dl[k], u);
  }
  _adm.innerHTML = html;
}

function createAdmin (t) {
  let a = {
    username : document.getElementById('new-username').value.trim(),
    passwd : document.getElementById('new-passwd').value.trim(),
    email : document.getElementById('new-email').value.trim(),
    role : _dm.selected('#new-admin-role').value
  };
  if (!user_preg.test(a.username)) {
    sysnotify('用户名格式错误，5～30字符，支持：“字母数字-_”。并且以字母开头', 'err', 6000);
    return ;
  }
  if (!email_preg.test(a.email)) {
    sysnotify('邮箱格式错误', 'err', 3000);
    return ;
  }
  if (!pass_preg.test(a.passwd)) {
    sysnotify('密码不符合要求，需要7～20位，字母数字和特殊字符（-_.!@#$%^&*）。', 'err', 6000);
    return ;
  }

  t.disabled = true;
  userApiCall('/admin', {
    method : 'POST',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(a)
  }).then(d => {
    if (d.status === 'OK') {
      a.id = d.data;
      _adminList.push(a);
      renderAdminList(_adminList);
      document.getElementById('new-username').value = '';
      document.getElementById('new-email').value = '';
      document.getElementById('new-passwd').value = '';
    } else {
      sysnotify(d.errmsg, 'err', 3000);
    }
  }).catch (err => {
    console.log(err);
  }).finally(() => {
    t.disabled = false;
  });
}

function getAdminList () {
  _dm.loading();
  userApiCall('/admin').then(d => {
    if (d.status === 'OK') {
      _adminList = d.data;
      renderAdminList(d.data);
    } else {
      sysnotify(d.errmsg, 'err');
    }
  }).finally(() => {
    _dm.unloading();
  });
}

window.onload = function () {
  getAdminList();
};

function showEditAdmin(username) {
  var u = null;
  for(let i=0;i<_adminList.length;i++) {
    if (username === _adminList[i].username) {
      u = _adminList[i];
    }
  }
  if (u === null) {return;}
  let html = `
    <div class="grid-x">
      <div class="cell small-5 medium-3 large-2"></div>
      <div class="cell small-4 medium-6 large-6"></div>
      <div class="cell small-3 medium-3 large-2">
        <a href="javascript:cancelEditAdmin();"><h3>X</h3></a>
      </div>
    </div>
  <div class="grid-x">
    <div class="cell small-1 medium-2 large-3"></div>
    <div class="cell small-10 medium-8 large-6">
      <p>${u.username}</p>
      <form onsubmit="return false;">
        <label>角色</label>
        <select onchange="cacheEditAdmin(this, 'role');">
          <option value="editor" ${u.role == 'editor' ? 'selected' : ''}>编辑</option>
          <option value="super"  ${u.role == 'super' ? 'selected' : ''}>管理员</option>
        </select>

        <label>邮箱</label>
        <input type="text" value="${u.email}" oninput="cacheEditAdmin(this, 'email');">

        <input type="checkbox" value="1" ${u.forbid ? 'checked' : ''} onchange="cacheEditAdmin(this, 'forbid');">禁止登录<br><br>

        <input type="submit" class="button hollow secondary" value="设置" onclick="updateAdmin(this, '${u.id}');">
        
      </form>
    </div>
    <div class="cell small-1 medium-2 large-3"></div>
  </div>`;
  syscover(html);
}

var _saveAdmin = {};
function cacheEditAdmin(t, k) {
  if (k === 'email' && email_preg.test(t.value)) {
    _saveAdmin.email = t.value;
  } else if (k === 'role') {
    _saveAdmin.role = t.options[t.selectedIndex].value;
  } else if (k === 'forbid') {
    _saveAdmin.forbid = t.checked ? 1 : 0;
  }
}

function updateAdmin (t, aid) {
  if (Object.keys(_saveAdmin).length <= 0) {
    return ;
  }
  t.disabled = true;
  return userApiCall('/admin/'+aid, {
    method : 'PUT',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(_saveAdmin)
  }).then(d => {
    if (d.status == 'OK') {
      sysnotify('OK');
      getAdminList();
      cancelEditAdmin();
    }
  }).catch(err => {

  }).finally(() => {
    t.disabled = false;
  });
}

function deleteAdmin(aid) {
  if (!confirm('删除以后，管理员账户就不存在，是否继续？')) {
    return ;
  }
  return userApiCall('/admin/'+aid,{
    method : 'DELETE',
  }).then(d => {
    if (d.status == 'OK') {
      sysnotify('OK');
      getAdminList();
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch(err => {
    sysnotify(err.message, 'err');
  });
}

function cancelEditAdmin() {
  _saveAdmin = {};
  unsyscover();
}

function showSetPasswd(username) {
  var u = null;
  for(let i=0;i<_adminList.length;i++) {
    if (username === _adminList[i].username) {
      u = _adminList[i];
    }
  }
  if (u === null) {return;}

  var html = `<div class="grid-x">
      <div class="cell small-5 medium-3 large-2"></div>
      <div class="cell small-4 medium-6 large-6"></div>
      <div class="cell small-3 medium-3 large-2">
        <a href="javascript:unsyscover();"><h3>X</h3></a>
      </div>
    </div>
    <div class="grid-x">
    <div class="cell small-1 medium-2 large-3"></div>
    <div class="cell small-10 medium-8 large-6">
      <p>设置管理员 ${u.username} 的密码</p>
      <form onsubmit="return false;">
        <input type="hidden" id="user-id" value="${u.id}">
        <label>密码验证</label>
        <input type="password" value="" id="my-passwd" placeholder="当前用户的密码">

        <label>新密码</label>
        <input type="password" value="" id="reset-passwd">

        <label>重复新密码</label>
        <input type="password" value="" id="re-reset-passwd" oninput="repassHint(this);">

        <input type="submit" class="button alert" value="设置" onclick="setAdminPasswd(this);">
      </form>
    </div>
    <div class="cell small-1 medium-2 large-3"></div>`;
    syscover(html);
}

function repassHint(t) {
  let pass = document.getElementById('reset-passwd').value;
  if (pass != t.value) {
    t.style.background = '#f29b82';
  } else {
    t.style.background = '';
  }
}

function setAdminPasswd (t) {
  var u = {
    id : document.getElementById('user-id').value.trim(),
    passwd : document.getElementById('my-passwd').value.trim(),
    newpasswd : document.getElementById('reset-passwd').value.trim(),
  };

  let repa = document.getElementById('re-reset-passwd').value.trim();
  if (repa !== u.newpasswd) {
    sysnotify('设置密码两次输入不一致','err');
    return ;
  }

  t.disabled = true;
  return userApiCall('/resetpasswd/'+u.id, {
    method : 'PUT',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(u)
  })
  .then(d => {
    if (d.status == 'OK') {
      sysnotify('OK');
      unsyscover();
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch(err => {
    sysnotify(err.message,'err');
  }).finally(() => {
    t.disabled = false;
  });
}