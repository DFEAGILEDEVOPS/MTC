import { Injectable } from '@angular/core';
import {
  StorageKeyTypesAll,
  AnswersStorageKey,
  AccessArrangementsStorageKey,
  PupilStorageKey,
  CompletedSubmissionStorageKey,
  TimeoutStorageKey,
  ConfigStorageKey,
  CheckStateStorageKey,
  PendingSubmissionStorageKey,
  QuestionsStorageKey,
  FeedbackStorageKey,
  SchoolStorageKey,
  DeviceStorageKey,
  AuditStorageKey,
  AccessTokenStorageKey,
  InputsStorageKey,
  CheckStartTimeStorageKey,
  TokensStorageKey
} from './storageKey';
import { Answer } from '../answer/answer.model';
import { AccessArrangements } from '../../access-arrangements';
import { AuditEntry } from '../audit/auditEntry';
import { Question } from '../question/question.model';

const accessArrangementsStorageKey = new AccessArrangementsStorageKey();
const accessTokenStorageKey = new AccessTokenStorageKey();
const auditStorageKey = new AuditStorageKey();
const checkStartTimeStorageKey = new CheckStartTimeStorageKey();
const checkStateStorageKey = new CheckStateStorageKey();
const completedSubmissionStorageKey = new CompletedSubmissionStorageKey();
const configStorageKey = new ConfigStorageKey();
const deviceStorageKey = new DeviceStorageKey();
const feedbackStorageKey = new FeedbackStorageKey();
const pendingSubmissionStorageKey = new PendingSubmissionStorageKey();
const pupilStorageKey = new PupilStorageKey();
const questionsStorageKey = new QuestionsStorageKey();
const schoolStorageKey = new SchoolStorageKey();
const timeoutStorageKey = new TimeoutStorageKey();
const tokensStorageKey = new TokensStorageKey();

@Injectable()
export class StorageService {

  setAnswer(answer: Answer) {
    this.setItem(new AnswersStorageKey(), answer);
  }

  getAccessArrangements() {
    return this.getItem(accessArrangementsStorageKey);
  }

  setAccessArrangements(accessArrangements: AccessArrangements) {
    this.setItem(accessArrangementsStorageKey, accessArrangements);
  }

  getPupil() {
    return this.getItem(pupilStorageKey);
  }

  setPupil(pupilData: Object) {
    this.setItem(pupilStorageKey, pupilData);
  }

  getCompletedSubmission() {
    return this.getItem(completedSubmissionStorageKey);
  }

  setCompletedSubmission(isCompleted: Boolean) {
    this.setItem(completedSubmissionStorageKey, isCompleted);
  }

  getConfig() {
    return this.getItem(configStorageKey);
  }

  setConfig(configData: Object) {
    this.setItem(configStorageKey, configData);
  }

  setTimeout(obj: Object) {
    this.setItem(timeoutStorageKey, obj);
  }

  removeTimeout() {
    this.removeItem(timeoutStorageKey);
  }

  getCheckState() {
    return this.getItem(checkStateStorageKey);
  }

  setCheckState(state: Number) {
    this.setItem(checkStateStorageKey, state);
  }

  removeCheckState() {
    this.removeItem(checkStateStorageKey);
  }

  getPendingSubmission() {
    return this.getItem(pendingSubmissionStorageKey);
  }

  setPendingSubmission(isPending: Boolean) {
    this.setItem(pendingSubmissionStorageKey, isPending);
  }

  getQuestions() {
    return this.getItem(questionsStorageKey);
  }

  setQuestions(questions: Array<Question>) {
    this.setItem(questionsStorageKey, questions);
  }

  getFeedback() {
    return this.getItem(feedbackStorageKey);
  }

  setFeedback(feedbackData: Object) {
    this.setItem(feedbackStorageKey, feedbackData);
  }

  getSchool() {
    return this.getItem(schoolStorageKey);
  }

  setSchool(schoolData: Object) {
    this.setItem(schoolStorageKey, schoolData);
  }

  getDeviceData() {
    return this.getItem(deviceStorageKey);
  }

  setDeviceData(deviceData) {
    this.setItem(deviceStorageKey, deviceData);
  }

  setAuditEntry(auditEntry: AuditEntry) {
    this.setItem(auditStorageKey, auditEntry);
  }

  getAccessToken() {
    return this.getItem(accessTokenStorageKey);
  }

  setAccessToken(accessToken: String) {
    this.setItem(accessTokenStorageKey, accessToken);
  }

  setInput(questionInput: Object) {
    this.setItem(new InputsStorageKey(), questionInput);
  }

  getCheckStartTime() {
    return this.getItem(checkStartTimeStorageKey);
  }

  setCheckStartTime(checkStartTime: Number) {
    this.setItem(checkStartTimeStorageKey, checkStartTime);
  }

  removeCheckStartTime() {
    this.removeItem(checkStartTimeStorageKey);
  }

  getToken() {
    return this.getItem(tokensStorageKey);
  }

  setToken(token: String) {
    this.setItem(tokensStorageKey, token);
  }

  private setItem(key: StorageKeyTypesAll, value: Object | Array<Object>): void {
    if (!key) {
      throw new Error('key is required');
    }
    localStorage.setItem(key.toString(), JSON.stringify(value));
  }

  private getItem(key: StorageKeyTypesAll): any {
    if (!key) {
      throw new Error('key is required');
    }
    let item = localStorage.getItem(key.toString());
    // try/catch as not all localstorage items are JSON, e.g. ai_session
    try {
      item = JSON.parse(item);
    } catch (_) { }
    return item;
  }

  private removeItem(key: StorageKeyTypesAll): void {
    if (!key) {
      throw new Error('key is required');
    }
    localStorage.removeItem(key.toString());
  }

  clear(): void {
    localStorage.clear();
  }

  getKeys(): string[] {
    return Object.keys(localStorage);
  }

  getAllItems(): any {
    return Object.keys(localStorage).reduce((obj, key) => {
      let item = localStorage.getItem(key);
      // try/catch as not all localstorage items are JSON, e.g. ai_session
      try {
        item = JSON.parse(item);
      } catch (_) { }
      obj[key] = item;
      return obj;
    }, {});
  }
}
