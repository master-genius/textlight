module.exports = {
    host : 'localhost',
    port : 5432,
    user : 'textlight',
    database : 'textlight',
    password : '',
    max: 8,
    // all valid client config options are also valid here
    // in addition here are the pool specific configuration parameters:
    // number of milliseconds to wait before timing out when connecting a new client
    // by default this is 0 which means no timeout

    // connectionTimeoutMillis: 0,
    // number of milliseconds a client must sit idle in the pool and not be checked out
    // before it is disconnected from the backend and discarded
    // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
    
    // idleTimeoutMillis: 8000,
};
