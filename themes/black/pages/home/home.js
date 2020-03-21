var _dlist = [];
var _total = 0;
var _pagesize = 18;

if (wo.get('doc-home-init') === null) {
  wo.set('doc-home-init', '1');
  wo.set('doc-home-page', '1');
  wo.set('doc-home-totalpage', '1');
  wo.set('doc-home-kwd', '');
}

function parseArgs () {
  var kwd = wo.get('doc-home-kwd');
  var qstr = '';
  var tag = '';
  if (kwd.indexOf('@') == 0) {
    tag = kwd.substring(1);
    kwd = '';
  } else if (kwd.indexOf('@') > 0) {
    try {
      kwd = kwd.split('@');
      tag = kwd[1].trim();
      kwd = kwd[0].trim();
    } catch (err){}
  }

  if (kwd) {
    qstr += `&kwd=${encodeURIComponent(kwd)}`;
  }
  if (tag) {
    qstr += `&tag=${encodeURIComponent(tag)}`;
  }

  return qstr;
}

async function getCount() {
  let qstr = parseArgs();
  return apiCall(`/api/count?type=news${qstr}`).then(d => {
    _total = d.data;
    _pagi.setpi(wo.get('doc-home-page'), totalPage(_total, _pagesize));
  });
}

function fmtDoc(d) {
  return `<div class="card"><a href="/show?id=${d.id}" target="_blank">
    <h5 style="color:#4a4a4f;" class="title-inline">${d.title.trim()}</h5>
    <p style="color:#676869;">
     ${d.updatetime.substring(0,16).replace('T', ' ')}
    </p>
  </a></div>`;
}

function docList () {
  let qstr = parseArgs();
  let page = wo.get('doc-home-page');
  qstr += `&pagesize=${_pagesize}&offset=${_pagesize * (page-1)}`;
  apiCall('/api/content?type=news'+qstr).then(d => {
    _dm.renderList(document.getElementById('doc-list'), d.data, fmtDoc);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }).catch(err => {

  });
}

async function searchDoc(t) {
  if (t.value.trim() === '') {
    wo.set('doc-home-kwd', '');
    t.value = '';
  } else {
    wo.set('doc-home-kwd', t.value.replace(/[\s\;\+\-]+/ig, ''));
  }
  wo.set('doc-home-page', '1');
  await getCount();
  docList();
}

var _inputOutTime = 0;
async function listenOrSearch(t) {
  if (_inputOutTime == 0) {
    _inputOutTime = Date.now();
    setTimeout(() => {
      _inputOutTime = 0;
      wo.set('doc-home-kwd', t.value.trim());
      if (t.value === '') {
        document.getElementById('clear-search-btn').className = 'hidden';
      }
      searchDoc(t);
    }, 666);
    return ;
  }
}

async function getSiteInfo() {
  return apiCall('/api/siteinfo').then(d => {
    if (d.status === 'OK') {
      return d.data;
    }
  })
  .catch(err => {});
}

function loadSideInfo(data) {
  let d = document.getElementById('side-info');
  if (d) {
    d.innerHTML = data;
  }
}

async function getSideInfo () {
  return apiCall('/api/side/word').then(d => {
    if (d.status === 'OK') {
      loadSideInfo(d.data);
    }
  }).catch (err => {});
}

function searchClickTag (tag) {
  let d = document.getElementById('search-kwd');
  d.value = `@${tag}`;
  searchDoc(d);
}

async function getTags () {
  return apiCall('/api/tags').then(d => {
    if (d.status === 'OK') {
      let td = document.getElementById('doc-tags');
      var ht = '';
      let tags = d.data.split(',').filter(p=>p.length > 0);
      let tmp = '';
      for (let i=0; i< tags.length; i++) {
        tmp = tags[i].trim();
        ht += `<div class="card"><a href="javascript:searchClickTag('${tmp}');" style="color:#bc5920;">${tmp}</a></div>`;
      }
      td.innerHTML = ht;
    }
  })
  .catch (err => { console.log(err); });
}

window.onload = async function() {
  _pagi.pageTemp('#pagination');
  _pagi.pageEvent((p) => {
    wo.set('doc-home-page', p);
    docList();
  });
  document.getElementById('search-kwd').value = wo.get('doc-home-kwd');
  await getCount();
  docList();

  let si = await getSiteInfo();
  if (si) {
    document.getElementById('sitename').innerHTML = si.sitename;
    document.getElementById('sitename').cite = location.host;
  }
  getSideInfo();
  getTags();
};

function showClear(t) {
  if (t.value.trim() === '') {
    document.getElementById('clear-search-btn').className = 'hidden';
    return ;
  }
  document.getElementById('clear-search-btn').className = '';
}

function hideClear(t) {
  setTimeout(() => {
    document.getElementById('clear-search-btn').className = 'hidden';
  }, 450);
}

function clearSearch() {
  document.getElementById('clear-search-btn').className = 'hidden';
  let d = document.getElementById('search-kwd');
  d.value = '';
  searchDoc(d);
}

window.onscroll = function () {
  _gotoTop.onScroll();
};
