var _siteinfo = {
  sitename : '',
  title : '',
  theme : '',
  copyright :'',
  themeList : []
};

var sitmp = {};

function renderInfo(r = null) {
  let a = _siteinfo;
  if (r !== null) {a = r;}
  var html = `<table>
    <tr>
      <td>网站名称</td>
      <td>${a.sitename}</td>
    </tr>
    <tr>
      <td>网站标题</td>
      <td>${a.title}</td>
    </tr>
    <tr>
      <td>主题</td>
      <td>${a.theme}</td>
    </tr>
    <tr>
      <td>版权信息</td>
      <td>${a.copyright}</td>
    </tr>
    <tr>
      <td>页面底部</td>
      <td>${a.footer}</td>
    </tr>
  </table>
    <div><a href="javascript:showEditSiteInfo();">编辑</a></div>
  `;
  let d = document.getElementById('siteinfo');
  if (d) {
    d.innerHTML = html;
  }
}

async function getSiteInfo() {
  return userApiCall('/site').then(d => {
    if (d.status === 'OK') {
      _siteinfo = d.data;
      renderInfo();
    }
  })
  .catch (err => {
    sysnotify(err.message, 'err');
  });
}

function showEditSiteInfo() {
  var themes = '';
  for (let i=0;i<_siteinfo.themeList.length; i++) {
    themes += `<option value="${_siteinfo.themeList[i]}" ${_siteinfo.themeList[i] == _siteinfo.theme ? 'selected' : ''}`
              +`>${_siteinfo.themeList[i]}</option>`;
  }
  var html = `<div class="grid-x">
    <div class="cell small-1 medium-2 large-3"></div>
    <div class="cell small-10 medium-8 large-6">
    <div style="text-align:center;"><a href="javascript:cancelSet();"><h2>X</h2></a></div>
  <form onsubmit="return false;">
    <label>名称</label>
    <input type="text" value="${_siteinfo.sitename}" oninput="cacheInput(this, 'sitename');">

    <label>标题</label>
    <input type="text" value="${_siteinfo.title}" oninput="cacheInput(this, 'title');">
    
    <label>版权信息</label>
    <textarea oninput="cacheInput(this, 'copyright');" style="width:100%;height:6rem;">${_siteinfo.copyright}</textarea>

    <label>页面底部</label>
    <textarea oninput="cacheInput(this, 'footer');" style="width:100%;height:10rem;">${_siteinfo.footer}</textarea>
    
    <label>主题</label>
    <select onchange="cacheInput(this, 'theme');">${themes}</select>
    <input type="submit" class="button success" onclick="setSiteInfo();" value="设置">
  </form></div>
  <div class="cell small-1 medium-2 large-3"></div>
  </div>`;
  syscover(html);
}

function cancelSet() {
  sitmp = {};
  unsyscover();
}

function cacheInput(t, k) {
  if (k === 'theme') {
    sitmp.theme = t.options[t.selectedIndex].value;
  } else {
    sitmp[k] = t.value;
  }
}

async function setSiteInfo() {
  for (let k in sitmp) {
    if (sitmp[k] === _siteinfo[k]) {
      delete sitmp[k];
    }
  }
  if (Object.keys(sitmp).length == 0) {
    return ;
  }
  return userApiCall('/site', {
    method : 'POST',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(sitmp)
  })
  .then(d => {
    if (d.status === 'OK') {
      sitmp = {};
      location.reload(true);
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch(err => {
    sysnotify(err.message, 'err');
  });
}

window.onload = function () {
  getSiteInfo();
};

