var _dlist = [];

function getDoc(id) {

}

function fmtDoc(d) {
  return `<div>${d.title}</div>`;
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