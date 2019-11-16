var _cur_cid = null;
var contentList = {};
var _lecture = {};
var _lec_map = {};

var lecid = null;
if (location.href.indexOf('?') > 0) {
    var queryStr = location.href.split('?')[1];
    var queryVal = queryStr.split('&');
    var queryParam = {};
    var tmp = [];
    for(var i=0; i<queryVal.length; i++) {
        if (queryVal[i].indexOf('=') < 0) {
            continue;
        }
        tmp = queryVal[i].split('=');
        queryParam[tmp[0]] = tmp[1];
    }
    if (queryParam['id']) {
        lecid = queryParam['id'];
    }
}

if (wo.get('lecture-id')) {
    if (wo.get('lecture-id') !== lecid) {
        wo.remove('lecture-cur-id');
        wo.set('lecture-id', lecid);
    }
} else {
    wo.set('lecture-id', lecid);
}


var contentDom = document.getElementById('content');

contentDom.addEventListener('click', function(event){
    event.stopPropagation();
}, true);

contentDom.addEventListener('touchstart', function(event){
    event.stopPropagation();
}, true);

contentDom.addEventListener('touchend', function(event){
    event.stopPropagation();
}, true);

var lecDom = document.getElementById('lecture-list');

function showFooterList(t) {
    let d = document.getElementById('footer-lecture-list');

    if (d.innerHTML == '') {
        t.innerHTML = '· X ·';
        d.innerHTML = '<br>' + lecDom.innerHTML + '<br>';
        d.className = "footer-lecture-block footer-lecture-list";
    } else {
        t.innerHTML = '| | |';
        d.innerHTML = '';
        d.className = "footer-lecture-list";
    }
}

function hideFooterList() {
    let d = document.getElementById('footer-lecture-list');
    d.innerHTML = '';
    d.className = "footer-lecture-list";
    document.getElementById('footer-list-btn').innerHTML = '| | |';
}

function showContent(cot) {
    var contentHTML = `<div>
        ${cot.data.replace(/<table>/ig, '<table class="table-no-wrap">')}
    </div>
    <div class="content-author">
        &copy; ${cot.author}
    </div>`;
    contentDom.innerHTML = contentHTML;

    var alist = contentDom.querySelectorAll('a');
    for(let i=0; i<alist.length; i++) {
        alist[i].target = "_blank";
    }
}

async function setCurContent() {
    await getContent();
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

async function loadLecture(lec) {
    document.getElementById('lecture-name').innerHTML = lec.name;
    _lecture = lec;
  
    for(let i=0; i<lec.list.length; i++) {
        _lec_map[ lec.list[i].id] = lec.list[i].name;
    }
    showLectureList();
    if (wo.get('lecture-cur-id')) {
        _cur_cid = wo.get('lecture-cur-id');
        setSelected(_cur_cid);
        setCurContent();
    } else {
        loadLectureHome(lec);
    }
}

function loadLectureHome(lec) {
    contentDom.innerHTML = `<p>${lec.description}</p>`;
    if (lec.image && lec.image.length > 0) {
      contentDom.innerHTML = `<div class="grid-x">
        <div class="cell small-12 medium-12 large-6">
        <img src="${lec.image}" style="max-width:100%;width:auto;height:auto;" alt="^^">
        </div>
        <div class="cell small-12 medium-12 large-6" style="padding:0.5rem;">
        <div>${contentDom.innerHTML}</div>
        </div>`;
    }
}

function showLectureList() {
    var html = `<div class="lecture-list-ch">
        <span onclick="showDescri();" class="lecture-list-name">简介</span>
    </div>`;
    var ind = 1;
    for (let k in _lec_map) {
        html += `<div class="lecture-list-ch" id="${k}">
          <a href="javascript:;" onclick="showCurContent(this);" id="${k}" class="lecture-list-name" title="${_lec_map[k]}">
            ch${ind > 9 ? '' : '0'}${ind}. ${_lec_map[k]}
          </a>
        </div>`;
        ind += 1;
    }
    lecDom.innerHTML = html;
}

function showDescri () {
    setSelected('');
    wo.remove('lecture-cur-id');
    _cur_cid = null;
    loadLectureHome(_lecture);
}

function setSelected (lid) {
    let leclist = lecDom.querySelectorAll('.lecture-list-name');
    for (let i=0; i<leclist.length; i++) {
        if (lid == leclist[i].id) {
            leclist[i].className = 'lecture-list-name lecture-list-selected';
        } else {
            leclist[i].className = 'lecture-list-name';
        }
    }
    wo.set('lecture-cur-id', lid);
    _cur_cid = lid;
}

async function showCurContent(t) {
    setSelected(t.id);
    setCurContent();
}

async function getContent() {
    _dm.unloading();
    if (contentList[_cur_cid]) {
        showContent(contentList[_cur_cid]);
        return ;
    }
    _dm.loading();
    return apiCall('/mapi/query/'+_cur_cid).then(d => {
        if (d.status == 'OK') {
            contentList[_cur_cid] = d.data;
            showContent(contentList[_cur_cid]);
        } else {
            contentDom.innerHTML = d.errmsg;
        }
    })
    .catch (err => { console.log(err); })
    .finally(() => {
      _dm.unloading();
    });

}

window.onpageshow = async function() {
  if (lecid) {
    apiCall('/mapi/lecture/'+lecid).then(d => {
      if (d.status == 'OK') {
        loadLecture(d.data);
      } else {
        contentDom.innerHTML = d.errmsg;
      }
    })
    .catch (err => { console.log(err); });
  }
};

window.onscroll = function () {
  _gotoTop.onScroll();
};