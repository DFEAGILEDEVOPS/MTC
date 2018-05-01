'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/* global describe, beforeEach, it, expect spyOn */
const pupilMock = require('../../mocks/pupil');
const sqlResponseMock = require('../../mocks/sql-modify-response');
const sqlService = require('../../../services/data-access/sql.service');
describe('pupil.data.service', () => {
    let service;
    describe('#sqlFindOneById', () => {
        beforeEach(() => {
            spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilMock]));
            service = require('../../../services/data-access/pupil.data.service');
        });
        it('it makes the expected calls', async () => {
            const res = await service.sqlFindOneById(42);
            expect(sqlService.query).toHaveBeenCalled();
            expect(typeof res).toBe('object');
        });
    });
    describe('#sqlUpdate', () => {
        beforeEach(() => {
            spyOn(sqlService, 'update').and.returnValue(Promise.resolve(sqlResponseMock));
            service = require('../../../services/data-access/pupil.data.service');
        });
        it('it makes the expected calls', async () => {
            const obj = {
                id: 42,
                updatedProp: 'new value'
            };
            const res = await service.sqlUpdate(obj);
            expect(sqlService.update).toHaveBeenCalled();
            expect(typeof res).toBe('object');
        });
    });
});
