'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const uuidV4 = require("uuid/v4");
const winston = require("winston");
const expressWinston = require("express-winston");
const azure = require("./azure");
const config = require('./config');
const index_1 = require("./routes/index");
if (process.env.NODE_ENV !== 'production') {
    winston.level = 'debug';
}
// Creates and configures an ExpressJS web server.
class App {
    // Run configuration methods on the Express instance.
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        azure.startInsightsIfConfigured();
    }
    // Configure Express middleware.
    middleware() {
        if (config.Logging.Express.UseWinston === 'true') {
            /**
             * Express logging to winston
             */
            this.express.use(expressWinston.logger({
                transports: [
                    new winston.transports.Console({
                        json: true,
                        colorize: true
                    })
                ],
                meta: true,
                // msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
                expressFormat: true,
                colorize: false,
                ignoreRoute: function (req, res) {
                    return false;
                } // optional: allows to skip some log messages based on request and/or response
            }));
        }
        else {
            this.express.use(morgan('dev'));
        }
        /* Security Directives */
        this.express.use(cors());
        this.express.use(helmet());
        // Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
        const oneYearInSeconds = 31536000;
        this.express.use(helmet.hsts({
            maxAge: oneYearInSeconds,
            includeSubDomains: false,
            preload: false
        }));
        // azure uses req.headers['x-arr-ssl'] instead of x-forwarded-proto
        // if production ensure x-forwarded-proto is https OR x-arr-ssl is present
        this.express.use((req, res, next) => {
            if (azure.isAzure()) {
                this.express.enable('trust proxy');
                req.headers['x-forwarded-proto'] = req.header('x-arr-ssl') ? 'https' : 'http';
            }
            next();
        });
        // force HTTPS in azure
        this.express.use((req, res, next) => {
            if (azure.isAzure()) {
                if (req.protocol !== 'https') {
                    res.redirect(`https://${req.header('host')}${req.url}`);
                }
            }
            else {
                next();
            }
        });
        this.express.use(bodyParser.json());
    }
    // Configure API endpoints.
    routes() {
        /* API endpoints */
        this.express.use('/', index_1.default);
        // catch 404 and forward to error handler
        this.express.use(function (req, res, next) {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        // error handler
        this.express.use(function (err, req, res, next) {
            const errorId = uuidV4();
            // only providing error information in development
            // @TODO: change this to a real logger with an error string that contains
            // all pertinent information. Assume 2nd/3rd line support would pick this
            // up from logging web interface (e.g. ELK / LogDNA)
            winston.error('ERROR: ' + err.message + ' ID:' + errorId);
            winston.error(err.stack);
            // return the error as an JSON object
            err.message = err.message || 'An error occurred';
            err.errorId = errorId;
            err.status = err.status || 500;
            if (req.app.get('env') === 'development') {
                res.status(err.status).json({ error: err.message, errorId: errorId });
            }
            else {
                res.status(err.status).json({ error: 'An error occurred' });
            }
        });
    }
}
exports.default = new App().express;
