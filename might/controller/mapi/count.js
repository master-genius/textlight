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
        c.res.body = {
            status : 0,
            count: c.service.docdb.count(cstr, group)
        };
    }

    __mid () {
        return [
            {
                name : 'apipass',
            }
        ];
    }

}

module.exports = count;
