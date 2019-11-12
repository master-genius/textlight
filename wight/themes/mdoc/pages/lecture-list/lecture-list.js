var _lecList = [];

function searchLec (t) {
  let rg = new RegExp(t.value, 'i');
  let tmplist = [];
  for (let i=0; i < _lecList.length; i++) {
    if (rg.test(_lecList[i].name) || rg.test(_lecList[i].description)) {
      tmplist.push(_lecList[i]);
    }
  }
  showLectureList(tmplist);
}

function getLecList () {
  return apiCall('/mapi/lecture').then(d => {
    if (d.status == 'OK') {
      _lecList = d.data;
      showLectureList(d.data);
    } else {
      sysnotify('获取信息错误');
    }
  }).catch (err => {
    console.log(err);
  });
}

function lecTemp (lec) {
  return `
    <div class="card" style="height:12rem;overflow-y:hidden;">
    <a href="/lecture?id=${lec.id}" style="color:#454647;">
      <p style="font-size:109%;">
          &sect; ${lec.name}</p>
      <p style="color:#676869;font-size:85%;">
        &copy; ${lec.author}
      </p>
      <p style="color:#676869;font-size:85%;">
        ${lec.description}
      </p>
    </a>
    </div>
  `;
}

function showLectureList(li) {
  let lecDom = document.getElementById('lecture-list');
  _dm.renderList(lecDom, li, lecTemp);
}

window.onpageshow = async function() {
  getLecList();
};

window.onscroll = function () {
  this._gotoTop.onScroll();
};