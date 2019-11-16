const fs = require('fs');

class about {

    constructor () {
        this.mode = 'restful';
        this.param = '/';
    }

    async get (c) {
        c.res.body = await c.service.funcs.readFile('./cofnig/aboutus');
        c.setHeader('content-type', 'text/plain; charset=utf-8');
    }

}

module.exports = about;

