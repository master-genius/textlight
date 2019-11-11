class count {

    constructor () {
        this.mode = 'restful';
        this.param = '/';
    }

    async get (c) {
        let group = null;
        if (c.query.group) {
            group = c.query.group;
        }
        let cstr = '';
        if (c.query.q) {
            cstr = c.query.q.substring(0,20);
        }
        c.res.body = c.service.api.ret(0, c.service.docdb.count(cstr, group));
    }

}

module.exports = count;
