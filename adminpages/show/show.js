let qsearch = location.search;
if (qsearch[0] == '?') {
  qsearch = qsearch.substring(1);
}

let qarr = qsearch.split('&');

let _id = null;
for (let i=0;i<qarr.length; i++) {
  if (qarr[i].indexOf('id=') == 0) {
    _id = qarr[i].split('=')[1];
    break;
  }
}

function renderContent(d) {
  var html = `<div>
    <h3>${d.title}</h3>
    <p><hr></hr></p>
    <p>${d.content}</p>
  </div>`;
  let dm = document.getElementById('content');
  if (dm) {
    dm.innerHTML = html;
  }
}


window.onload = function () {
  if (_id !== null && _id.trim().length > 0) {
    userApiCall('/content/'+_id).then(d => {
      if (d.status == 'OK') {
        renderContent(d.data);
      } else {
        sysnotify(d.errmsg, 'err');
      }
    })
    .catch (err => {
      sysnotify(err.message, 'err');
    });
  }
};
