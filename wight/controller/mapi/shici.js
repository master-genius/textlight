class shici {

    constructor () {
        this.mode = 'restful';
        this.param = '/*';
    }

    async get (c) {
        
        let id = c.param.starPath;

        let r = c.service.sdb.getById(id);
        if (r === null) {
            c.res.body = {
                status: 4004,
                errmsg: 'not found'
            };
            return ;
        }

        r.status = 0;
        c.res.body = r;
    }

    async list (c) {
        let cstr = c.query.q || '';
        let count = c.query.count !== undefined ? parseInt(c.query.count) : 25;
        if (count <= 0) { count = 25; }
        let offset = c.query.offset !== undefined
                        ? parseInt(c.query.offset) 
                        : 0;
        if (offset < 0) { offset = 0; }

        let group = null;
        if (c.query.group !== undefined && c.query.group.length > 0) {
            group = c.query.group;
        }
        cstr = cstr.substring(0, 20);
        
        if ( (cstr == '' || cstr == '.*') && (group === null || group === '') )
        {
            let mtotal = c.service.sdb.total > 1
                        ? c.service.sdb.total - 1
                        : c.service.sdb.total;
            offset = parseInt(Math.random() * 10000) % mtotal;
        }

        let result = c.service.sdb.select(cstr, count, offset, group, true);

        c.res.body = result;
    }

    __mid () {
        return [
            {
                name: 'apipass',
                path: ['list', 'get']
            },
            {
                name: 'apicache',
                path: ['get', 'list']
            }
        ];
    }

}

module.exports = shici;
