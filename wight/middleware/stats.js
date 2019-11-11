class stats {

    constructor () {
        this.start = 0;
        this.daystart = Date.now();
        this.logList = {};
        this.routes = [
            '/weekhome', '/query/*', '/blog/:id'
        ];
    }

    async middleware (c, next) {
        await next(c);

        if (c.status() !== 200) {
            return ;
        }

        let tm = Date.now();
        let log = {
            ip : c.ip,
            ua : c.headers['user-agent'],
            path : c.path,
            route : c.routepath,
            time : tm,
            count : 1,
        };
        if (c.routepath == '/blog/:id') {
            log.id = c.param.id;
        } else if (c.routepath == '/query/*') {
            log.id = c.param.starPath;
        }
        let lid = c.helper.sha1(`${c.ip}${c.headers['user-agent']}${c.path}`);
        if (!this.logList[lid]) {
            this.logList[lid] = log;
        } else if (this.logList[lid].time <= log.time - 1200000) {
            this.logList[lid].count += 1;
        }

        if (tm - this.start > 3600000
            || Object.keys(this.logList).length > 1)
        {
            this.start = tm;
            let isnextday = false;
            if (tm - 86400000 >= this.daystart) {
                c.service.homestats = 0;
                isnextday = true;
            }

            let db = c.service.pool;
            let sql = 'UPDATE blog SET totalcount = totalcount+$1 WHERE id=$2';
            for(let k in this.logList) {
                if (this.logList[k].path == '/blog/:id') {
                    db.query(sql, [
                        this.logList[k].count,
                        this.logList[k].id
                    ]);
                }
            }
        }
    }

}

module.exports = stats;
