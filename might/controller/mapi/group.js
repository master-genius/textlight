class group {
    constructor () {
        this.mode = 'restful';
        this.param = '/';
    }

    async list (c) {
        let groups = Object.keys(c.service.docdb.groups);
        c.res.body = c.service.api.ret(0, groups);
    }
}

module.exports = group;
