class group {
    constructor () {
        this.mode = 'restful';
        this.param = '/';
    }

    async list (c) {
        c.res.body = Object.keys(c.service.docdb.groups);
    }
}

module.exports = group;
