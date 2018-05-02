'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path = require("path");
const fs = require("fs");
const moment = require('moment');
const { postCheck } = require('../controllers/check-submission');
class IndexRouter {
    /**
     * Initialize the IndexRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/ping', (req, res) => this.getPing(req, res));
        /* check-started microservice */
        this.router.route('/submit').all((req, res) => {
            if (req.method !== 'POST')
                return res.sendStatus(405);
            postCheck(req, res);
        });
    }
    async getPing(req, res) {
        // get build number from /build.txt
        // get git commit from /commit.txt
        let buildNumber = 'NOT FOUND';
        let commitId = 'NOT FOUND';
        try {
            buildNumber = await this.getBuildNumber();
        }
        catch (error) {
            // error
        }
        try {
            commitId = await this.getCommitId();
        }
        catch (error) {
            // error
        }
        res.setHeader('Content-Type', 'application/json');
        let obj = {
            'Build': buildNumber,
            'Commit': commitId,
            'CurrentServerTime': moment().toISOString()
        };
        return res.status(200).send(obj);
    }
    /* Health check */
    getCommitId() {
        return new Promise(function (resolve, reject) {
            const commitFilePath = path.join(__dirname, '..', 'public', 'commit.txt');
            fs.readFile(commitFilePath, 'utf8', function (err, data) {
                if (!err) {
                    resolve(data);
                }
                else {
                    reject(new Error('NOT FOUND'));
                }
            });
        });
    }
    getBuildNumber() {
        // Promise wrapper function
        return new Promise(function (resolve, reject) {
            const buildFilePath = path.join(__dirname, '..', 'public', 'build.txt');
            fs.readFile(buildFilePath, 'utf8', function (err, data) {
                if (!err) {
                    resolve(data);
                }
                else {
                    reject(new Error('NOT FOUND'));
                }
            });
        });
    }
}
exports.IndexRouter = IndexRouter;
// Create the HeroRouter, and export its configured Express.Router
const indexRoutes = new IndexRouter();
indexRoutes.init();
exports.default = indexRoutes.router;
