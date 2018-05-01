'use strict';
let ConnectionPool = require('tedious-connection-pool');
const config = require('../../config');
const winston = require('winston');
// TODO add to config object
let poolConfig = {
    min: config.Sql.Pooling.MinCount,
    max: config.Sql.Pooling.MaxCount,
    log: config.Sql.Pooling.LoggingEnabled
};
// full config details: https://github.com/tediousjs/tedious/blob/master/src/connection.js
let connectionConfig = {
    appName: config.Sql.Application.Name,
    userName: config.Sql.Application.Username,
    password: config.Sql.Application.Password,
    server: config.Sql.Server,
    options: {
        port: config.Sql.Port,
        database: config.Sql.Database,
        encrypt: true,
        requestTimeout: config.Sql.Timeout,
        useUTC: false
    }
};
let pool = null;
const sqlPoolService = {
    /**
     * Initialise the connection pool.  Called once per application instance
     */
    init: () => {
        if (pool !== null)
            return;
        pool = new ConnectionPool(poolConfig, connectionConfig);
        pool.on('error', function (err) {
            winston.error(err);
        });
    },
    /**
     * Get a connection from the pool.
     * @return {Promise}
     */
    getConnection: () => {
        return new Promise((resolve, reject) => {
            if (pool === null) {
                sqlPoolService.init();
            }
            pool.acquire(function (err, connection) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(connection);
            });
        });
    },
    /**
     * Disconnect all pool connections
     */
    drain: () => {
        if (pool) {
            pool.drain();
        }
    }
};
module.exports = sqlPoolService;
