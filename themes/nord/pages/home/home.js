var _dlist = [];

function getDoc(id) {

}

function fmtDoc(d) {
  return `<div class="card"><a href="/page/show?id=${d.id}" target="_blank">
    <h3>${d.title.trim()}</h3>
    <p style="color:#676869;">
     ${d.updatetime.substring(0,16).replace('T', ' ')}
    </p>
  </a></div>`;
}

function docList () {
  apiCall('/api/content?type=news').then(d => {
    _dm.renderList(document.getElementById('doc-list'), d.data, fmtDoc);
  }).catch(err => {

  });
}

window.onload = function() {
  //_pagi.pageTemp('#pagination');
  docList()
}