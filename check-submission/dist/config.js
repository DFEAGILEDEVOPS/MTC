'use strict';
require("dotenv/config");
const toBool = require("to-bool");
const oneMinuteInMilliseconds = 60000;
const getEnvironment = () => {
    return process.env.ENVIRONMENT_NAME || 'Local-Dev';
};
module.exports = {
    PORT: process.env.PORT || '3005',
    // autoMark true | false - Automatically mark the check data when we receive it: boolean
    autoMark: process.env.hasOwnProperty('AUTO_MARK') ? toBool(process.env.AUTO_MARK) : true,
    Sql: {
        Enabled: true,
        Database: process.env.SQL_DATABASE || 'mtc',
        Server: process.env.SQL_SERVER || 'localhost',
        Port: process.env.SQL_PORT || 1433,
        Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
        Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true,
        Application: {
            Name: process.env.SQL_APP_NAME || 'mtc-local-dev',
            Username: process.env.SQL_APP_USER || 'mtcAdminUser',
            Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
        },
        Pooling: {
            MinCount: process.env.SQL_POOL_MIN_COUNT || 5,
            MaxCount: process.env.SQL_POOL_MAX_COUNT || 10,
            LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : true
        }
    },
    Logging: {
        Express: {
            UseWinston: process.env.EXPRESS_LOGGING_WINSTON || false
        }
    },
    Environment: getEnvironment(),
    JwtSecret: process.env.JWT_SECRET || 'dev-token'.padEnd(64, '-')
};
