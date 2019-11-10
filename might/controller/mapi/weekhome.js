class weekhome {
    
    constructor () {
        this.mode = 'restful';
        this.param = '/';
        this.weekname = [
            'sun','mon','tue','wed','thu','fri','sat'
        ];

        this.daytotal = {
            '0': -1,
            '1': -1,
            '2': -1,
            '3': -1,
            '4': -1,
            '5': -1,
            '6': -1
        };
    }

    async get (c) {
        c.setHeader('Cache-Control', 'public, max-age=10800');
        let group = '_week';
        let day = (new Date()).getDay();
        let daygroup = this.weekname[day];

        let wgrp = `${group}/${daygroup}`;
        
        if (this.daytotal[day] < 0) {
            this.daytotal[day] = c.service.wdb.count('.*', wgrp);
        }

        let offset = 0;
        offset = parseInt(Math.random() * this.daytotal[day]);

        if (offset == this.daytotal[day] - 1 && offset > 0) {
            offset -= 1;
        }

        let ret = c.service.wdb.select('.*', 1, offset, group, true);
        if (ret.length  == 0) {
            c.res.body = {
                status : 1,
                errmsg : 'not found'
            };
            return ;
        }

        ret[0].status = 0;
        c.res.body = ret[0];
    }

    /* __mid () {
        return [
            {
                name : '@stats',
                path : ['get']
            }
        ]
    } */

}

module.exports = weekhome;
