const fs = require('fs');

class dayread {
  
  constructor () {
    this.mode = 'restful';
    this.param = '/';
    this.last = '';
    this.daypreg = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/gi;
  }

  async list (c) {
    let day = c.service.funcs.formatTime(new Date(), true);
    let year = (new Date()).getFullYear();

    if (c.query.day !== undefined) {
      if (c.query.year !== undefined && !isNaN(c.query.year)) {
        day = c.query.day;
        year = c.query.year;
      }
    }

    let daylist = c.service.docdb.select(`${year}/${day}`, 0, 0, '_read', true);
    if (daylist.length == 0) {
      let total = c.service.docdb.count('', '_read');
      daylist = c.service.docdb.select('.*', 1, total-1, '_read', true);
    }

    c.res.body = daylist;
  }

  __mid () {
    return [
      {
        name: 'apicache',
        path: [ 'list']
      }
    ];
  }

}

module.exports = dayread;
