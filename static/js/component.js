var _comp = {
    pagination : {},
    login : {},
};

_comp.pagination.pageTemp = function (id = null) {
    var temp = `
        <div class="grid-x" style="text-align:center;line-height:2.5rem;width:100%;">
            <div class="cell small-4 medium-4 large-4" id="com-prev-page" style="border-right:solid 0.05rem #c5c5c5;border-top:solid 0.05rem #c5c5c5;">
                <span>&lt;&lt;</span>
            </div>

            <div class="cell small-4 medium-4 large-4" title="点击跳转页" id="com-jump-page" style="padding-left:0.2rem;padding-right:0.2rem;background:#ecedef;">
                <span id="com-cur-page">1</span>/<span id="com-total-page">1</span>
            </div>

            <div class="cell small-4 medium-4 large-4" id="com-next-page" style="border-left:solid 0.05rem #c5c5c5;border-bottom:solid 0.05rem #c5c5c5;">
                <span>&gt;&gt;</span>
            </div>
        </div>
    `;

    if (id !== null && document.querySelector(id)) {
        document.querySelector(id).innerHTML = temp;
    } else {
        return temp;
    }
};

_comp.pagination.jumpPage = function (callback) {
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

_comp.pagination.prevPage = function (callback) {
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

_comp.pagination.nextPage = function (callback) {
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

_comp.pagination.firstPage = function (callback) {
    document.querySelector('#com-cur-page').innerHTML = 1;
    callback(1);
};

_comp.pagination.lastPage = function (callback) {
    var total = document.querySelector('#com-total-page');
    var cur = document.querySelector('#com-cur-page');
    var last_page = parseInt(total.innerHTML);

    if (last_page > 0 && typeof callback === 'function') {
        cur.innerHTML = last_page;
        callback(last_page);
    }
};

_comp.pagination.setPageInfo = function (cur_page, total_page) {
    document.querySelector('#com-cur-page').innerHTML = cur_page;
    document.querySelector('#com-total-page').innerHTML = total_page;
;}

_comp.pagination.pageEvent = function (callback) {
    document.querySelector('#com-prev-page').addEventListener('click', function(e){
        _comp.pagination.prevPage(callback);
    });

    document.querySelector('#com-next-page').addEventListener('click', function(e){
        _comp.pagination.nextPage(callback);
    });

    document.querySelector('#com-jump-page').addEventListener('click', function(e){
        _comp.pagination.jumpPage(callback);
    });

};

_comp.login.pageTemp = function (id) {
    var temp = `<div classl="full-container" style="z-index:999;position:fixed;background-color:rgba(21,21,23,0.25);width:100%;height:100%;margin:auto;padding:0.2rem;padding-top:3%;top:0;">
    <div class="grid-x">
    <div class="cell small-1 medium-2 large-4"></div>
    <div class="cell small-10 medium-8 large-4" style="background-color:#fafaff;padding:0.5rem;">
        <div style="text-align: center;">
            <h4>用户登录</h4>
        </div>
        <form onsubmit="return false;" autocomplete="off">
            <label>邮箱/用户名</label>
            <input type="text" placeholder="邮箱/用户名" id="comp-login-username" required>
            <input type="password" placeholder="密码" id="comp-login-passwd" required>
            <div style="text-align: center;">
            <input type="submit" class="button hollow primary" value="登录" id="comp-login-submit-btn" onclick="_comp.login.userLogin();">
            </div>
        </form>
        <p class="help-text" id="comp-login-help-info"></p>
        <div style="text-align:right;">
          <a href="/page/forget-passwd" target="_blank">忘记密码</a>&nbsp;&nbsp;
          <a href="javascript:_comp.login.pageTemp('${id}');" id="comp-login-cancel" style="color:#452334;">取消</a>
        </div>
    </div>
    <div class="cell small-1 medium-2 large-4"></div>
    </div>
    </div>`;

    if (id !== null && document.querySelector(id)) {
        if (document.querySelector(id).innerHTML.trim() == '') {
            document.querySelector(id).innerHTML = temp;
        } else {
            document.querySelector(id).innerHTML = '';
        }
    } else {
        return temp;
    }
};

_comp.login.callback = null;

_comp.login.userLogin = function () {
    let u = document.getElementById('comp-login-username');
    let p = document.getElementById('comp-login-passwd');
    if (typeof _comp.login.callback === 'function') {
        _comp.login.callback(u.value, p.value);
    }
};

_comp.login.helpInfo = function (info = '') {
    document.getElementById('comp-login-help-info').innerHTML = info;
};
