var _pagesize = 6;
var _imageList = [];
var _total_page = 1;

function totalPage (t, p) {
  return (t % p == 0) ? (t/p) : (parseInt(t/p)+1);
}

function renderImageList () {
  let d = document.getElementById('image-list');
  if (!d) {return ;}
  let page = parseInt(wo.get('img-page'));
  if (page > _total_page) {
    page = 1;
    wo.set('img-page', page);
    _pagi.setpi(page, _total_page);
  }
  
  let offset = (page-1)*_pagesize;

  _dm.renderList(d, _imageList.slice(offset, offset+_pagesize), (m) => {
    return `<div class="cell small-12 medium-6 large-4" style="padding:0.5rem;text-align:center;">
      <img src="${location.protocol}//${location.host}/api/image/${m}" style="max-height:16rem;width:auto;">
      <pre style="overflow-x:auto;">${location.protocol}//${location.host}/api/image/${m}</pre>
      <div style="text-align:left;">
        <input type="checkbox" value="${m}" class="image-check-list">
      </div>
    </div>`;
  });
  document.body.scrollTop = 0;
}

function sortImages (imgs) {
  imgs.sort((a, b) => {
    let ar = a.split('_')[1];
    let br = b.split('_')[1];
    if (ar == br) {
      return 0;
    }
    return (ar > br) ? -1 : 1;
  });
}

async function getImages() {
  return userApiCall('/image').then(d => {
    _imageList = d;
    sortImages(_imageList);
    _total_page = totalPage(_imageList.length, _pagesize);
    _pagi.setpi(wo.get('img-page'), _total_page);
    renderImageList();
  })
  .catch(err => {
    sysnotify(err.message, 'err');
  });
}

if (wo.get('img-init') === null) {
  wo.set('img-init', '1');
  wo.set('img-page', '1');
  wo.set('img-total-page', '1');
}

function selectAllImages(t) {
  let stat = t.checked;
  let nds = document.querySelectorAll('.image-check-list');
  for(let i=0;i<nds.length;i++) {
    nds[i].checked = stat;
  }
}

function deleteSelectImages() {
  let nds = _dm.getSelect('.image-check-list', false, 'value');
  if (nds.length <= 0) {
    return ;
  }
  if (!confirm('确认删除？')) {
    return ;
  }
  syscover(`<div style="text-align:center;padding:0.8rem;margin-top:18%;">
    <h5 style="text-shadow:0.2px 0.2px 0.2px #afafaf;color:#343536;">deleting···</h5>
  </div>`, 'background:rgba(23,23,25, 0.42);');
  return userApiCall('/image', {
    method : 'DELETE',
    headers : {
      'content-type' : 'text/plain'
    },
    body : JSON.stringify(nds)
  })
  .then(d => {
    if (d.status === 'OK') {
      sysnotify('OK');
    } else {
      sysnotify(d.errmsg, 'err');
    }
    getImages();
  })
  .catch(err => {
    sysnotify(err.message, 'err');
  })
  .finally(() => {
    setTimeout(() => {
      unsyscover();
    }, 850);
  });
}

window.onload = function () {
  _pagi.pageTemp('#pagination');
  _pagi.pageEvent((p) => {
    wo.set('img-page', p);
    renderImageList();
  });
  getImages();
};
