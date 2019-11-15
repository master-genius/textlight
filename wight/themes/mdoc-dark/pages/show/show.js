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
  d.data = d.data.replace(/\<img/ig, '<img lazyload="on" ');
  var html = `<div>
    <div class="doc-title">
      <h3>${d.name}</h3>
    </div>
    <p><hr></hr></p>
    <p>${d.data}</p>
  </div>`;
  let dm = document.getElementById('content');
  if (dm) {
    dm.innerHTML = html;
    let ads = dm.querySelectorAll('a');
    for(let i=0;i<ads.length;i++) {
      ads[i].target="_blank";
    }
  }
  document.querySelector('title').innerHTML += ' - ' + d.name;
}


window.onload = function () {
  if (_id !== null && _id.trim().length > 0) {
    _dm.loading();
    apiCall('/mapi/query/'+_id).then(d => {
      if (d.status == 'OK') {
        renderContent(d.data);
      } else {
        sysnotify(d.errmsg, 'err');
      }
    })
    .catch (err => {
      sysnotify(err.message, 'err');
    }).finally(() => {
      _dm.unloading();
    });
  }
};

window.onscroll = function () {
  _gotoTop.onScroll();
};
