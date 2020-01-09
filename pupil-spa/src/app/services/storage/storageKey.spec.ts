import * as uuid from 'uuid';

import {
  AccessArrangementsStorageKey,
  AnswersStorageKey,
  AuditStorageKey,
  CheckStartTimeStorageKey,
  CheckStateStorageKey,
  CompletedSubmissionStorageKey,
  ConfigStorageKey,
  DeviceStorageKey,
  FeedbackStorageKey,
  InputsStorageKey,
  PendingSubmissionStorageKey,
  PupilStorageKey,
  QuestionsStorageKey,
  SchoolStorageKey,
  SessionStorageKey, TimeoutStorageKey, TokensStorageKey
} from './storageKey';

describe('storageKey', () => {
  const uuidV4 = uuid.v4();
  describe('AnswersStorageKey', () => {
    it('should create a composite key with a prefix and suffix', () => {
      const answersStorageKey = new AnswersStorageKey();
      expect(answersStorageKey.toString().split('-')[0]).toBe('answers');
      expect(answersStorageKey.toString().split('answers-')[1].length).toEqual(uuidV4.length);
    });
  });
  describe('InputsStorageKey', () => {
    it('should create a composite key with a prefix and suffix', () => {
      const inputsStorageKey = new InputsStorageKey();
      expect(inputsStorageKey.toString().split('-')[0]).toBe('inputs');
      expect(inputsStorageKey.toString().split('inputs-')[1].length).toEqual(uuidV4.length);
    });
  });
  describe('SessionStorageKey', () => {
    it('should create a static key', () => {
      const sessionStorageKey = new SessionStorageKey();
      expect(sessionStorageKey.toString()).toBe('session');
    });
  });
  describe('AuditStorageKey', () => {
    it('should create a composite key with a prefix and suffix', () => {
      const auditStorageKey = new AuditStorageKey();
      expect(auditStorageKey.toString().split('-')[0]).toBe('audit');
      expect(auditStorageKey.toString().split('audit-')[1].length).toEqual(uuidV4.length);
    });
  });
  describe('QuestionsStorageKey', () => {
    it('should create a static key', () => {
      const questionsStorageKey = new QuestionsStorageKey();
      expect(questionsStorageKey.toString()).toBe('questions');
    });
  });
  describe('ConfigStorageKey', () => {
    it('should create a static key', () => {
      const configStorageKey = new ConfigStorageKey();
      expect(configStorageKey.toString()).toBe('config');
    });
  });
  describe('PupilStorageKey', () => {
    it('should create a static key', () => {
      const pupilStorageKey = new PupilStorageKey();
      expect(pupilStorageKey.toString()).toBe('pupil');
    });
  });
  describe('SchoolStorageKey', () => {
    it('should create a static key', () => {
      const schoolStorageKey = new SchoolStorageKey();
      expect(schoolStorageKey.toString()).toBe('school');
    });
  });
  describe('FeedbackStorageKey', () => {
    it('should create a static key', () => {
      const feedbackStorageKey = new FeedbackStorageKey();
      expect(feedbackStorageKey.toString()).toBe('feedback');
    });
  });
  describe('CheckStateStorageKey', () => {
    it('should create a static key', () => {
      const checkStateStorageKey = new CheckStateStorageKey();
      expect(checkStateStorageKey.toString()).toBe('checkstate');
    });
  });
  describe('DeviceStorageKey', () => {
    it('should create a static key', () => {
      const deviceStorageKey = new DeviceStorageKey();
      expect(deviceStorageKey.toString()).toBe('device');
    });
  });
  describe('PendingSubmissionStorageKey', () => {
    it('should create a static key', () => {
      const pendingSubmissionStorageKey = new PendingSubmissionStorageKey();
      expect(pendingSubmissionStorageKey.toString()).toBe('pending_submission');
    });
  });
  describe('CompletedSubmissionStorageKey', () => {
    it('should create a static key', () => {
      const completedSubmissionStorageKey = new CompletedSubmissionStorageKey();
      expect(completedSubmissionStorageKey.toString()).toBe('completed_submission');
    });
  });
  describe('AccessArrangementsStorageKey', () => {
    it('should create a static key', () => {
      const accessArrangementsStorageKey = new AccessArrangementsStorageKey();
      expect(accessArrangementsStorageKey.toString()).toBe('access_arrangements');
    });
  });
  describe('TokensStorageKey', () => {
    it('should create a static key', () => {
      const tokensStorageKey = new TokensStorageKey();
      expect(tokensStorageKey.toString()).toBe('tokens');
    });
  });
  describe('TimeoutStorageKey', () => {
    it('should create a static key', () => {
      const timeoutStorageKey = new TimeoutStorageKey();
      expect(timeoutStorageKey.toString()).toBe('time_out');
    });
  });
  describe('CheckStartTimeStorageKey', () => {
    it('should create a static key', () => {
      const checkStartTimeStorageKey = new CheckStartTimeStorageKey();
      expect(checkStartTimeStorageKey.toString()).toBe('check_start_time');
    });
  });
});
