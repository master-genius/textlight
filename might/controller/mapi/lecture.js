class lecture {

    constructor () {
        this.param = '/*';
    }

    async get(c) {
        let id = c.param.starPath;

        let r = c.service.docdb.getLecById(id);
        if (r === null) {
            c.res.body = {
                status: 4004,
                errmsg: 'not found'
            };
            return ;
        }
        c.res.body = c.service.api.ret(0, r);
    }

    async list (c) {
        let cstr = c.query.q || '';
        /*
        let count = c.query.count ? parseInt(c.query.count) : 25;
        if (count <= 0) { count = 25; }
        let offset = c.query.offset ? parseInt(c.query.offset) : 0;
        if (offset < 0) { offset = 0; }

        if (cstr == '' || cstr == '.*') {
            let mtotal = c.service.docdb.total > 5 
                        ? c.service.docdb.total - 5
                        : c.service.docdb.total;
            offset = parseInt(Math.random() * 10000) % mtotal;
        }
        */

        //let result = c.service.docdb.searchLec(cstr, count, offset);
        let result = c.service.docdb.lectureList;

        c.res.body = c.service.api.ret(0, result);
    }


}

module.exports = lecture;
