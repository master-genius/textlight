var _pagesize = 12;
var _total = 0;
var _curpage = 1;

function totalPage (t, p) {
  return (t % p == 0) ? (t/p) : (parseInt(t/p)+1);
}

async function getDoc (id) {
  _dm.loading();
  return userApiCall('/content/'+id).then(d => {
    if (d.status === 'OK') {
      return d.data;
    } else {
      sysnotify('获取文档失败', 'err');
      return false;
    }
  }).catch (err => {
    sysnotify(err.message, 'err');
    return false;
  }).finally(() => {
    _dm.unloading(); 
  });
}

async function neDoc (id = null) {
  if (id === null) {
    if (wo.get('edit-id') !== 'null' && wo.get('edit-id') !== null) {
      clearCache();
    }
    wo.set('edit-id', 'null');
    wo.set('edit-status', 'on');
    showEditDoc(loadCache());
  } else {
    try {
      let d = await getDoc(id);
      if (d === false) {
        return ;
      }
      wo.set('edit-id', id);
      wo.set('edit-status', 'on');
      showEditDoc(d);
    } catch (err){
      return ;
    }
  }
}

function showEditDoc(nd = null) {
  let d = {
    title : '',
    content : '',
    keywords : '',
    ctype : '',
    doctype : '',
    is_public : '',
    addtime : '',
    updatetime : '',
    gid : '',
    tags : ''
  };
  if (nd !== null) {
    d = nd;
  }
  var dochtml = `
  <div class="grid-x">
    <div class="cell small-9 medium-8 large-8" style="text-align:center;padding:0.4rem;line-height:2.4rem;">
      ${nd ? ('编辑：'+nd.title) : '新文档'}</div>
    <div class="cell small-3 medium-4 large-4" style="text-align:center;">
      <a href="javascript:offEdit();"><h3>X</h3></a>
    </div>
  </div>

  <div class="grid-x" style="padding: 0.8rem;">
    
    <div class="cell medium-1 large-1 hide-for-small-only"></div>
    <div class="cell small-12 medium-8 large-7">
      <form onsubmit="return false;">
        <div style="padding-left:0.2rem;padding-right:0.4rem;">
          <input type="text" id="doc-title" value="${d.title}" placeholder="标题" onchange="saveContent()">
        </div>
        <div id="content-editor" style="padding-left:0.2rem;padding-right:0.2rem;">
          <div id="editor-zone">
            <div id="editor-menu" class="editor-menu" style="margin-bottom: 0.5rem;border-left:solid 0.06rem #696969;background:#efedf5;"></div>

            <div id="editor-block" class="editor-block" style="height:30rem;width:100%;border-left:solid 0.06rem #696969;border-bottom:dashed 0.06rem #696969;" spellcheck="false"></div>
          </div>
        </div>
        <div class="grid-x" style="padding:0.5rem;line-height:2.5rem;">
          <div class="cell small-4 medium-4 large-3">
            <label>类型</label>
            <select id="c-type" onchange="saveContent()">
              <option value="news" ${nd ? (nd.ctype === 'news' ? 'selected' :'') : ''}>文档</option>
              <option value="company" ${nd ? (nd.ctype === 'company' ? 'selected' :'') : ''}>页面</option>
            </select>
          </div>
          <div class="cell small-8 medium-8 large-9" style="padding-left:0.2rem;">
            <label>关键词</label>
            <input type="text" value="${d.keywords}" id="doc-keywords" onchange="saveContent()">
          </div>
          <div class="cell small-12">
            <label>标签</label>
            <input type="text" value="${d.tags}" id="doc-tags" placeholder="标签可以用于扁平化分组，并可以灵活的扩展功能和业务需求" onchange="saveContent()">
          </div>
        </div>
        
        &nbsp;&nbsp;<input type="checkbox" value="1" id="is-public" onchange="saveContent()" ${nd ? (nd.is_public ? 'checked' : '') : ''}>发布<br><br>
        <div style="text-align:center;">
          <input type="submit" value="保存" class="button secondary small" onclick="postContent();" id="post-btn">
        </div>
      </form>
    </div>
    <div class="cell medium-3 large-4 hide-for-small-only"></div>
  </div>`;
  syscover(dochtml);
  initEditor(d.content);
}

function offEdit() {
  unsyscover();
  wo.set('edit-status', 'off');
  if (wo.get('off-remove') == '1') {
    clearCache();
    wo.remove('off-remove');
  }
  wo.remove('edit-id');
}

var _editor = null;
function initEditor (html = '') {
  if (_editor === null) {
    var E = window.wangEditor;
    _editor = new E('#editor-menu', '#editor-block');
  }
  
  _editor.customConfig.uploadImgMaxLength = 1;
  _editor.customConfig.zIndex = 0;
  _editor.customConfig.onchangeTimeout  = 800;

  _editor.customConfig.onchange= function(html) {
    saveContent();
  }

  _editor.customConfig.customUploadImg = function (files, insert) {

    for (var i=0; i< files.length; i++) {
      let postdata = new FormData();
      postdata.append('image', files[i]);
      _dm.loading();
      userApiCall('/image/', {
        method : 'POST',
        body : postdata
      })
      .then(d => {
        if (d.status === 'OK') {
          insert(`/api/image/${d.data.path}/${d.data.name}`);
        } else {
          sysnotify(d.errmsg, 'err');
        }
      })
      .catch (err => {
        console.log(err);
        sysnotify(err.message, 'err');
      }).finally(() => {
        _dm.unloading();
      });
    }
  }

  _editor.customConfig.menus = [
      'head',
      'bold',
      'fontSize',
      'fontName',
      'italic',
      'underline',
      'strikeThrough',
      'foreColor',
      'backColor',
      'link',
      'list',
      'justify',
      'quote',
      'image',
      'table',
      'video',
      'code',
      'undo',
      'redo'
  ];
  _editor.create();
  if (html.length > 0) {
    _editor.txt.html(html);
  }
}

function loadCache () {
  let cont = wo.get('doc-cache', true);
  return cont;
}

function clearCache() {
  wo.remove('doc-cache');
  wo.remove('edit-id');
}

function getEditDoc () {
  let cont = {
    title : document.getElementById('doc-title').value.trim(),
    content : _editor.txt.html(),
    is_public : document.getElementById('is-public').checked ? 1 : 0,
    ctype : _dm.selected('#c-type').value,
    tags : document.getElementById('doc-tags').value,
    keywords : document.getElementById('doc-keywords').value
  };
  return cont;
}

function saveContent () {
  let cont = getEditDoc();
  wo.set('doc-cache', cont, true);
}

function postContent () {
  let cont = getEditDoc();
  let id = wo.get('edit-id');
  let apiname = '/content';
  let method = 'POST';
  if (id !== 'null' && id !== null) {
    cont.id = id;
    apiname += '/'+id;
    method = 'PUT';
  }
  let pbtn = document.getElementById('post-btn');
  if (pbtn) {pbtn.disabled = true;}
  _dm.loading();
  userApiCall(apiname, {
    method : method,
    mode : 'cors',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(cont)
  })
  .then(d => {
    if (d.status === 'OK') {
      sysnotify(d.status);
      wo.set('off-remove', '1');
      if (method === 'POST') {
        wo.set('edit-id', d.data);
        docList();
      }
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch (err => {
    console.log(err);
  }).finally(() => {
    if (pbtn) {pbtn.disabled = false;}
    _dm.unloading();
  });
}

function docTemp (d) {
  return `<div class="small-12 medium-6 large-4 doc-list">
    <div class="doc-list-content">
    <p><a href="javascript:neDoc('${d.id}');"><img src="/a/siteimage/edit.png" style="width:auto;height:auto;">
    <span style="font-size:105%;">${d.title}</span></a></p>
    <div>状态：${d.is_public ? '已发布' : '未发布'}${d.is_top ? ', 置顶' : ''}</div>
    <div>作者：${d.adminname}</div>
    <div>${d.updatetime.substring(0,10)}</div>
    <input type="checkbox" value="${d.id}" class="doc-list-cell" style="zoom:125%;">
    <div style="text-align:right;">
      <a href="javascript:previewDoc('${d.id}');" style="font-size:86%;color:#454648;">查看</a>
    </div>
    </div>
  </div>`;
}

if (wo.get('doc-list-init') === null) {
  wo.set('doc-list-init', '1');
  wo.set('kwd', '');
  wo.set('cur-page', '1');
  wo.set('total-page', '1');
  wo.set('c-type', '--all--');
}

function docList () {
  let page = parseInt(wo.get('cur-page'));
  let kwd = wo.get('kwd');
  let ctype = wo.get('c-type');
  //let total_page = parseInt(wo.get('total-page'));

  let qstr = `?offset=${(page-1)*_pagesize}&kwd=${encodeURIComponent(kwd)}`;
  if (ctype !== '--all--') {
    qstr += `&type=${encodeURIComponent(ctype)}`;
  }

  userApiCall('/content'+qstr).then(d => {
    _dm.renderList(document.getElementById('doc-list'), d.data, docTemp);
    document.body.scrollTop = 0;
  })
  .catch (err => {
    sysnotify(err.message, 'err');
  });
}

async function docCount () {
  return userApiCall('/count').then(d => {
    return parseInt(d.data);
  })
  .catch(err => {
    sysnotify(err.message, 'err');
  });
}

window.onload = async function () {
  if (wo.get('kwd')) {
    document.getElementById('doc-kwd').value = wo.get('kwd');
  }
  _dm.selected('#c-type-select', wo.get('c-type'));

  _pagi.pageTemp('#pagination');
  _pagi.pageEvent(function(p) {
    wo.set('cur-page', p);
    docList();
  });
  _total = await docCount();
  let pages = totalPage(_total, _pagesize);
  _pagi.setpi(wo.get('cur-page'), pages);
  if (wo.get('edit-status') === 'on') {
    let id = wo.get('edit-id');
    neDoc(id === 'null' ? null : id);
  }
  docList();
};

/* var _ctrl_start = false;
    
function mdKeyDown(t, event) {
  if (event.key == 'Tab') {
    return false;
  }

  if (event.key === 'Control') {
    _ctrl_start = true;
    return false;
  }
  else {
    if (!_ctrl_start) {
        return true;
    }
    switch (event.key) {
      case 's':
        postContent();
        return false;
        
      default: 
        return true;
    }
    return false;
  }
  return true;
}

function mdKeyUp(t, event) {
  if (event.key === 'Control') {
    _ctrl_start = false;
  }
}
 */
function selectAllDoc(t) {
  let stat = t.checked;
  let nds = document.querySelectorAll('.doc-list-cell');
  for(let i=0;i<nds.length;i++) {
    nds[i].checked = stat;
  }
}

function softDeleteSelect() {
  let nds = _dm.getSelect('.doc-list-cell', false, 'value');
  if (nds.length == 0) {
    return ;
  }
  userApiCall('/content/a?soft=0', {
    method : 'DELETE',
    header : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(nds)
  })
  .then(async d => {
    if (d.status === 'OK') {
      let page = parseInt(wo.get('cur-page'));
      let t = await docCount();
      let total_page = totalPage(t, _pagesize);
      if (page > total_page) {
        page = total_page;
        wo.set('cur-page', page);
        _pagi.setpi(page, total_page);
      }
      docList();      
    } else {
      sysnotify(d.errmsg);
    }
  })
  .catch(err => {
    sysnotify(err.message, 'err');
  });
}

function ctypeSearch(t) {
  let r = t.options[t.selectedIndex];
  wo.set('c-type', r.value);
  wo.set('cur-page', 1);
  docList();
}

function searchList() {
  let kwd = document.getElementById('doc-kwd').value.trim();
  wo.set('cur-page', '1');
  wo.set('kwd', kwd);
  docList();
}

function clearSearch() {
  document.getElementById('doc-kwd').value = '';
  wo.set('cur-page', '1');
  wo.set('kwd', '');
  docList();
}

function renderPreview(d) {
  var html = `<div class="grid-x">
    <div class="cell hide-for-small-only medium-2 large-3"></div>
    <div class="cell small-12 medium-8 large-6" style="padding:0.6rem;">
      <h3>${d.title}</h3>
      <p><hr></hr></p>
      <p>${d.content}</p>
      <p>&nbsp;</p>
    </div>
    <div class="cell hide-for-small-only medium-2 large-3"></div>
    <div style="z-index:1024;position:fixed;bottom:0.1rem;left:25%;width:50%;background:#efeffa;text-align:center;padding:0.5rem;">
      <a href="javascript:unsyscover();">&nbsp;&nbsp;关闭预览&nbsp;&nbsp;</a>
    </div>
  </div>`;
  syscover(html);
}

function previewDoc(id) {
  userApiCall('/content/'+id).then(d => {
    if (d.status == 'OK') {
      renderPreview(d.data);
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch (err => {
    sysnotify(err.message, 'err');
  });
}

function setPublicStat(st) {
  let ispb = (st === 'on' ? 1 : 0);
  let idlist = [];
  let nds = document.querySelectorAll('.doc-list-cell');
  for(let i=0; i<nds.length;i++) {
    if (nds[i].checked) {
      idlist.push(nds[i].value);
    }
  }
  if (idlist.length == 0) {
    return ;
  }

  let postdata = {
    idlist : idlist,
    is_public : ispb
  }

  return userApiCall('/contentpub', {
    method: 'PUT',
    mode : 'cors',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(postdata)
  }).then(d => {
    if (d.status === 'OK') {
      docList();
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch (err => {
    sysnotify(err.message, 'err');
  });
}

var _tagidlist = [];
var _tagtmp = '';
function showSetSelectTag () {
  let idlist = [];
  let nds = document.querySelectorAll('.doc-list-cell');
  for(let i=0; i<nds.length;i++) {
    if (nds[i].checked) {
      idlist.push(nds[i].value);
    }
  }
  if (idlist.length == 0) {
    return ;
  }
  _tagidlist = idlist;
  var html = `
  <div class="grid-x">
    <div class="cell small-9 medium-8 large-8"></div>
    <div class="cell small-3 medium-4 large-4" style="text-align:center;">
      <a href="javascript:unsyscover();"><h3>X</h3></a>
    </div>
  </div>
  <div class="grid-x">
    <div class="cell hide-for-small-only medium-2 large-3"></div>
    <div class="cell small-12 medium-8 large-6" style="padding:0.6rem;">
      <form onsubmit="return false;">
        <input type="text" value="" placeholder="多个标签用 , 分开" oninput="cacheSetTag(this);">
        <input type="submit" class="button warning" value="设置" onclick="setSelectTag(this);">
      </form>
    </div>
  </div>`;
  syscover(html);
}

function cacheSetTag(t) {
  _tagtmp = t.value.trim();
}

function setSelectTag(t) {
  if (_tagidlist.length == 0) {
    return ;
  }
  let pd = {
    idlist : _tagidlist,
    tag : _tagtmp
  }
  t.disabled = true;
  return userApiCall('/settags', {
    method : 'PUT',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(pd)
  })
  .then(d => {
    if (d.status === 'OK') {
      docList();
      unsyscover();
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch (err => {

  }).finally(() =>{
    if (t) {
      t.disabled = false;
    }
    _tagtmp = '';
    _tagidlist = [];
  });
}

function setTopStat(st) {
  let istop = (st === 'on' ? 1 : 0);
  let idlist = [];
  let nds = document.querySelectorAll('.doc-list-cell');
  for(let i=0; i<nds.length;i++) {
    if (nds[i].checked) {
      idlist.push(nds[i].value);
    }
  }
  if (idlist.length == 0) {
    return ;
  }

  let postdata = {
    idlist : idlist,
    is_top : istop
  }

  return userApiCall('/contenttop', {
    method: 'PUT',
    mode : 'cors',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(postdata)
  }).then(d => {
    if (d.status === 'OK') {
      docList();
    } else {
      sysnotify(d.errmsg, 'err');
    }
  })
  .catch (err => {
    sysnotify(err.message, 'err');
  });
}