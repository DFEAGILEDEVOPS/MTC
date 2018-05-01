'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/* global describe, beforeEach, afterEach, expect, it */
const proxyquire = require('proxyquire').noCallThru();
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const jwtService = require('../../services/jwt.service');
const checkCompleteService = require('../../services/check-complete.service');
const { audit, inputs, answers } = require('../mocks/check-complete');
const validToken = 'good_token';
let sandbox;
let jwtPromiseHelper;
let checkCompletePromiseHelper;
let goodReq;
let controller;
let jwtPromise;
let checkCompletePromise;
describe('completed check controller', () => {
    function setupController() {
        sandbox.stub(jwtService, 'verify').returns(jwtPromise);
        sandbox.stub(checkCompleteService, 'completeCheck').returns(checkCompletePromise);
        return proxyquire('../../controllers/check-submission', {
            '../services/jwt.service': jwtService,
            '../services/check-complete.service': checkCompleteService
        });
    }
    beforeEach(() => {
        jwtPromise = new Promise((resolve, reject) => {
            jwtPromiseHelper = {
                resolve,
                reject
            };
        });
        checkCompletePromise = new Promise((resolve, reject) => {
            checkCompletePromiseHelper = {
                resolve,
                reject
            };
        });
        sandbox = sinon.sandbox.create();
        goodReq = httpMocks.createRequest({
            method: 'POST',
            url: '/submit',
            body: { audit, inputs, answers, validToken }
        });
    });
    afterEach(() => { sandbox.restore(); });
    describe('when access token validation succeeds', () => {
        beforeEach(() => {
            jwtPromiseHelper.resolve(true);
            checkCompletePromiseHelper.resolve(true);
            controller = setupController();
        });
        it('returns bad request if request payload is not provided', async (done) => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/submit',
                body: {}
            });
            const res = httpMocks.createResponse();
            await controller.postCheck(req, res);
            const data = JSON.parse(res._getData());
            expect(res.statusCode).toBe(400);
            expect(data.error).toBe('Bad request');
            done();
        });
        it('returns created if payload is provided', async (done) => {
            const req = goodReq;
            const res = httpMocks.createResponse();
            await controller.postCheck(req, res);
            expect(res.statusCode).toBe(201);
            done();
        });
    });
    describe('when access token validation fails', () => {
        beforeEach(() => {
            jwtPromiseHelper.reject('access token error : technical');
            controller = setupController();
        });
        it('sends a 401 error', async (done) => {
            const req = goodReq;
            const res = httpMocks.createResponse();
            await controller.postCheck(req, res);
            const data = JSON.parse(res._getData());
            expect(res.statusCode).toBe(401);
            expect(data.error).toBe('Unauthorised');
            done();
        });
    });
    describe('when the check-complete service fails', () => {
        beforeEach(() => {
            jwtPromiseHelper.resolve(true);
            checkCompletePromiseHelper.reject(new Error('a mock error'));
            controller = setupController();
        });
        it('returns server error', async (done) => {
            const req = goodReq;
            const res = httpMocks.createResponse();
            await controller.postCheck(req, res);
            const data = JSON.parse(res._getData());
            expect(res.statusCode).toBe(500);
            expect(data.error).toBe('Server error');
            done();
        });
    });
});
