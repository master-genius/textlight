var _pagi = {};
_pagi.pageTemp = function (id = null) {
    var temp = `
        <div class="row" style="text-align:center;line-height:2.8rem;width:100%;">
            <div class="col-sm-4 col-md-4 col-lg-4" id="com-prev-page">
                <span class="shadowed button">&lt;&lt;</span>
            </div>

            <div class="col-sm-4 col-md-4 col-lg-4" title="点击跳转页" id="com-jump-page">
              <span class="shadowed button">
              <span id="com-cur-page">1</span>/<span id="com-total-page">1</span>
              </span>
            </div>

            <div class="col-sm-4 col-md-4 col-lg-4" id="com-next-page">
                <span class="shadowed button">&gt;&gt;</span>
            </div>
        </div>
    `;

    if (id !== null && document.querySelector(id)) {
        document.querySelector(id).innerHTML = temp;
    } else {
        return temp;
    }
};

_pagi.jumpPage = function (callback) {
    var page = prompt('跳转至第几页？', '');
    if (page === null) {
        return ;
    }

    var total = document.querySelector('#com-total-page');
    var cur = document.querySelector('#com-cur-page');
    var end_page = parseInt(total.innerHTML);
    page = parseInt(page);
    var cur_page = parseInt(cur.innerHTML);

    if (page >0 && page <= end_page && page != cur_page) {
        if (typeof callback === 'function') {
            cur.innerHTML = page;
            callback(page);
        }
    }
};

_pagi.prevPage = function (callback) {
    var cur = document.querySelector('#com-cur-page');
    var cur_page = parseInt(cur.innerHTML);
    if (cur_page > 1) {
        cur_page -= 1;
        if (typeof callback === 'function') {
            cur.innerHTML = cur_page;
            callback(cur_page);
        }
    }
};

_pagi.nextPage = function (callback) {
    var total = document.querySelector('#com-total-page');
    var cur = document.querySelector('#com-cur-page');
    var cur_page = parseInt(cur.innerHTML);
    var total_page = parseInt(total.innerHTML);
    if (cur_page < total_page) {
        cur_page += 1;
        if (typeof callback === 'function') {
            cur.innerHTML = cur_page;
            callback(cur_page);
        }
    }
};

_pagi.firstPage = function (callback) {
    document.querySelector('#com-cur-page').innerHTML = 1;
    callback(1);
};

_pagi.lastPage = function (callback) {
    var total = document.querySelector('#com-total-page');
    var cur = document.querySelector('#com-cur-page');
    var last_page = parseInt(total.innerHTML);

    if (last_page > 0 && typeof callback === 'function') {
        cur.innerHTML = last_page;
        callback(last_page);
    }
};

_pagi.setpi = function (cur_page, total_page) {
    document.querySelector('#com-cur-page').innerHTML = cur_page;
    document.querySelector('#com-total-page').innerHTML = total_page;
;}

_pagi.pageEvent = function (callback) {
    document.querySelector('#com-prev-page').addEventListener('click', function(e){
        _pagi.prevPage(callback);
    });

    document.querySelector('#com-next-page').addEventListener('click', function(e){
        _pagi.nextPage(callback);
    });

    document.querySelector('#com-jump-page').addEventListener('click', function(e){
        _pagi.jumpPage(callback);
    });

};
