'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/* global describe, beforeEach, afterEach, it, expect */
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const checkMock = require('../../mocks/check');
const sqlService = require('../../../services/data-access/sql.service');
describe('check.data.service', () => {
    let service;
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => sandbox.restore());
    describe('#sqlFindOneByCheckCode', () => {
        let mock;
        beforeEach(() => {
            mock = sandbox.mock(sqlService).expects('query').resolves(checkMock);
            service = proxyquire('../../../services/data-access/check.data.service', {
                '../../services/data-access/sql.service': sqlService
            });
        });
        it('makes the expected calls', () => {
            service.sqlFindOneByCheckCode('mock-check-code');
            expect(mock.verify()).toBe(true);
        });
    });
});
