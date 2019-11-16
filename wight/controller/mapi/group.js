class group {
    constructor () {
        this.mode = 'restful';
        this.param = '/';
    }

    async list (c) {
        let groups = Object.keys(c.service.docdb.groups);
        let ind = c.service.docdb.grpLevel;
        c.res.body = c.service.api.ret(0, {
            group : groups,
            ind : ind,
            alias : c.service.alias
        });
    }
}

module.exports = group;
