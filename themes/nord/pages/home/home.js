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
  return `<div class="card"><a href="/page/show?id=${d.id}" target="_blank">
    <h4 style="color:#4a4a4f;">${d.title.trim()}</h4>
    <p style="color:#676869;">
     ${d.updatetime.substring(0,16).replace('T', ' ')}
    </p>
  </a></div>`;
}

function docList () {
  let qstr = parseArgs();
  apiCall('/api/content?type=news'+qstr).then(d => {
    _dm.renderList(document.getElementById('doc-list'), d.data, fmtDoc);
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

window.onload = async function() {
  _pagi.pageTemp('#pagination');
  _pagi.pageEvent((p) => {
    wo.set('doc-home-page', p);
    docList();
  });
  document.getElementById('search-kwd').value = wo.get('doc-home-kwd');
  await getCount();
  docList();
};