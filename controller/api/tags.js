class tags {
  constructor () {
    this.timestamp = 0;
    this.tagList = '';
  }

  async getTags(path, funcs) {
    if (this.timestamp + 600000 > Date.now()) {
      return this.tagList;
    }
    try {
      this.tagList = await funcs.readFile(path);
      this.timestamp = Date.now();
    } catch (err) {
      this.tagList = '';
      this.timestamp = 0;
    }
    return this.tagList;
  }

  async list (c) {
    let tlist = await this.getTags(c.service.sitedata+'/tags.txt', 
                    c.service.funcs);
    c.res.body = c.service.api.ret(0, tlist);
  }

  __mid () {
    return [
      {
        name : 'sitestatus'
      }
    ]
  }
}

module.exports = tags;
