/**
 * 接口规范
 * {
 *    status : [STATUS_STR_CODE],
 *    data | errmsg : [DATA]
 * }
 * 
 * status取值：
 *  OK
 *  ESYS
 *  ENOTFD
 *  EPERMDENY
 *  ENOTLOGIN
 *  EREGDENY
 *  EWRONG
 *  EBADDATA
 *  EUDEF
 */
class wapi {
  constructor () {
    this.errinfo = {
      'OK'      : 'ok',
      'ESYS'    : 'system error',
      'ENOTFD'  : 'resource not found',
      'EPERMDENY' : 'permission deny',
      'ENOTLOGIN' : 'not login',
      'EREGDENY'  : 'register not supported',
      'EWRONG'    : 'server wrong',
      'EBADDATA'  : 'bad data'
    };
  }

  einfo(e) {
    if (this.errinfo[e] === undefined) {
      return 'unknow error';
    }
    return this.errinfo[e];
  }

  ret (status, data = null) {
    let r = {
      status : 0,
    }
    if (status === 0 || status == 'OK') {
      r.status = 'OK';
      if (data === null) {
        r.data = this.einfo(r.status);
      } else {
        r.data = data;
      }
    } else if (status === -1) {
      r.status = 'EWRONG';
      r.errmsg = this.einfo(r.status);
    } else if (status === 'EUDEF') {
      r.status = status;
      r.errmsg = data;
    } else {
      if (this.errinfo[status] === undefined) {
        status = 'EWRONG';
      }
      r.status = status;
      r.errmsg = data || this.einfo(r.status);
    }
    return r;
  }

}

module.exports = wapi;
