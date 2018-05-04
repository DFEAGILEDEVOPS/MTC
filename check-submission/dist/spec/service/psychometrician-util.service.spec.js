'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/* global describe it expect beforeEach */
const service = require('../../services/psychometrician-util.service');
// Get a marked check mock
const checkMockOrig = require('../mocks/check-with-results');
// and a completedCheck that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results');
const pupilMockOrig = require('../mocks/pupil');
const schoolMockOrig = require('../mocks/school');
describe('psychometrician-util.service', () => {
    let completedCheckMock;
    beforeEach(() => {
        completedCheckMock = Object.assign({ check: {} }, completedCheckMockOrig);
        const checkMock = Object.assign({}, checkMockOrig);
        const pupilMock = Object.assign({}, pupilMockOrig);
        const schoolMock = Object.assign({}, schoolMockOrig);
        completedCheckMock.check = checkMock;
        pupilMock.school = schoolMock;
        completedCheckMock.check.pupilId = pupilMock;
    });
    describe('#getClientTimestamp from AuditEvent', () => {
        it('returns the clientTimestamp from an audit event', () => {
            const ts = service.getClientTimestampFromAuditEvent('CheckSubmissionPending', completedCheckMock);
            expect(ts).toBe('2018-02-11T15:43:26.772Z');
        });
        it('returns "error" if the clientTimestamp is missing', () => {
            completedCheckMock.data.audit.push({
                'type': 'CheckCompleteMissingTS'
            });
            const ts = service.getClientTimestampFromAuditEvent('CheckCompleteMissingTS', completedCheckMock);
            expect(ts).toBe('error');
        });
        it('returns "error" if there arent any logEntries', () => {
            completedCheckMock.data.audit = [];
            const ts = service.getClientTimestampFromAuditEvent('AnyEvent', completedCheckMock);
            expect(ts).toBe('error');
        });
    });
});
