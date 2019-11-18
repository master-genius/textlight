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
    qstr += `&q=${encodeURIComponent(kwd)}`;
  }
  if (tag) {
    qstr += `&group=${encodeURIComponent(tag)}`;
  }

  return qstr;
}

async function getCount() {
  let qstr = parseArgs();
  return apiCall(`/mapi/count?a=1${qstr}`).then(d => {
    _total = d.data;
    _pagi.setpi(wo.get('doc-home-page'), totalPage(_total, _pagesize));
  });
}

function fmtDoc(d) {
  let rr = d.id.split('/');
  let backimg = `background-image:url('/m/localimage/${d.headimg}');background-repeat:no-repeat;text-shadow:0.038rem 0.036rem #121315;background-size: 48%;background-position:right top;`;
  return `<div class="card" style="height:7.2rem;${d.headimg.length > 0 ? backimg : ''}" title="${d.name}">
    <a href="/show?id=${d.id}" target="_blank">
    <h5 style="color:#4a4a4f;" class="title-inline">${d.name.trim()}</h5>
    <p style="color:#676869;">@${rr[0]} ${rr.length > 1 ? rr[1] : ''}</p>
    <p style="color:#676869;">
     ${d.time}
    </p>
  </a></div>`;
}

function docList () {
  let qstr = parseArgs();
  let page = wo.get('doc-home-page');
  qstr += `&count=${_pagesize}&offset=${_pagesize * (page-1)}`;
  apiCall('/mapi/query?type=news'+qstr).then(d => {
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
  return apiCall('/mapi/siteinfo').then(d => {
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
  return apiCall('/mapi/side/word').then(d => {
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
  return apiCall('/mapi/group').then(d => {
    if (d.status === 'OK') {
      let td = document.getElementById('doc-tags');
      var ht = '';
      let tags = d.data.group;
      tags.sort((a, b) => {
        let al = a.toLowerCase();
        let bl = b.toLowerCase();
        if (al == bl) {
          return 0;
        }
        return (al > bl ? 1 : -1);
      });
      let tmpname = '';
      for (let i=0; i< tags.length; i++) {
        tmpname = tags[i];
        if (d.data.alias[ tags[i] ] !== undefined) {
          tmpname = d.data.alias[ tags[i] ];
        }
        ht += `<div class="card"><a href="javascript:searchClickTag('${tags[i]}');" style="color:#bc5920;padding:0.5rem;">${tmpname}</a></div>`;
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
  this._gotoTop.onScroll();
};
