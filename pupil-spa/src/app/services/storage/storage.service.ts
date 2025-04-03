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
  InputsStorageKey,
  CheckStartTimeStorageKey,
  TokensStorageKey
} from './storageKey';
import { Answer } from '../answer/answer.model';
import { AccessArrangements } from '../../access-arrangements';
import { AuditEntry } from '../audit/auditEntry';
import { Question } from '../question/question.model';

const accessArrangementsStorageKey = new AccessArrangementsStorageKey();
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

export interface IStorageService {
  clear(): void
  getAccessArrangements(key: AccessArrangementsStorageKey): any
  getAllItems(): any
  getCheckStartTime(): any
  getCheckState(key: CheckStateStorageKey): any
  getCompletedSubmission(): any
  getConfig(): any
  getDeviceData(): any
  getFeedback(): any
  getKeys(): string[]
  getPendingSubmission(): any
  getPupil(): any
  getQuestions(): any
  getSchool(): any
  getToken(): any
  removeCheckStartTime(): void
  removeCheckState(): void
  removeTimeout(): void
  setAccessArrangements(accessArrangements: AccessArrangements): void
  setAnswer(answer: Answer): void
  setAuditEntry(auditEntry: AuditEntry): void
  setCheckStartTime(checkStartTime: Number): void
  setCheckState(state: Number): void
  setCompletedSubmission(isCompleted: Boolean): any
  setConfig(config: Object): any
  setDeviceData(deviceData: any): void
  setFeedback(feedback: Object): void
  setInput(questionInput: Object): void
  setPendingSubmission(isPending: Boolean): void
  setPupil(pupilData: Object): void
  setQuestions(questions: Question[]): void
  setSchool(school: Object): void
  setTimeout(timeout: Object): void
  setToken(token: string): void
}

@Injectable()
export class StorageService implements IStorageService {

  getAccessArrangements() {
    return this.getItem(accessArrangementsStorageKey);
  }

  setAccessArrangements(accessArrangements: AccessArrangements) {
    this.setItem(accessArrangementsStorageKey, accessArrangements);
  }

  setAnswer(answer: Answer) {
    this.setItem(new AnswersStorageKey(), answer);
  }

  setAuditEntry(auditEntry: AuditEntry) {
    this.setItem(new AuditStorageKey(), auditEntry);
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

  getCheckState() {
    return this.getItem(checkStateStorageKey);
  }

  setCheckState(state: Number) {
    this.setItem(checkStateStorageKey, state);
  }

  removeCheckState() {
    this.removeItem(checkStateStorageKey);
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

  getDeviceData() {
    return this.getItem(deviceStorageKey);
  }

  setDeviceData(deviceData: any) {
    this.setItem(deviceStorageKey, deviceData);
  }

  getFeedback() {
    return this.getItem(feedbackStorageKey);
  }

  setFeedback(feedbackData: Object) {
    this.setItem(feedbackStorageKey, feedbackData);
  }

  setInput(questionInput: Object) {
    this.setItem(new InputsStorageKey(), questionInput);
  }

  getPendingSubmission() {
    return this.getItem(pendingSubmissionStorageKey);
  }

  setPendingSubmission(isPending: Boolean) {
    this.setItem(pendingSubmissionStorageKey, isPending);
  }

  getPupil() {
    return this.getItem(pupilStorageKey);
  }

  setPupil(pupilData: Object) {
    this.setItem(pupilStorageKey, pupilData);
  }

  getQuestions() {
    return this.getItem(questionsStorageKey);
  }

  setQuestions(questions: Array<Question>) {
    this.setItem(questionsStorageKey, questions);
  }

  getSchool() {
    return this.getItem(schoolStorageKey);
  }

  setSchool(schoolData: Object) {
    this.setItem(schoolStorageKey, schoolData);
  }

  setTimeout(obj: Object) {
    this.setItem(timeoutStorageKey, obj);
  }

  removeTimeout() {
    this.removeItem(timeoutStorageKey);
  }

  getToken() {
    return this.getItem(tokensStorageKey);
  }

  setToken(token: String) {
    this.setItem(tokensStorageKey, token);
  }

  protected setItem(key: StorageKeyTypesAll, value: Object | Array<Object>): void {
    if (!key) {
      throw new Error('key is required');
    }
    try {
      localStorage.setItem(key.toString(), JSON.stringify(value));
    } catch (error) {
      console.error('Storage-service: error setting key: ', error)
    }
  }

  protected getItem(key: StorageKeyTypesAll): any {
    if (!key) {
      throw new Error('key is required');
    }
    let item: string
    try {
      item = localStorage.getItem(key.toString());
    } catch (error) {
      console.error('Storage-service: error getting key: ', error)
    }
    // try/catch as not all localstorage items are JSON, e.g. ai_session
    try {
      item = JSON.parse(item);
    } catch (_) { }
    return item;
  }

  protected removeItem(key: StorageKeyTypesAll): void {
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

  getAllItems(): Record<string, any> {
    const output: Record<string, any> = {}
    Object.keys(localStorage).reduce((obj: any, key: string) => {
      let item = localStorage.getItem(key);
      // try/catch as not all localstorage items are JSON, e.g. ai_session
      try {
        item = JSON.parse(item);
      } catch (_) {
        // do nothing, it wasn't JSON
       }
     output[key] = item
    }, {});
    return output;
  }
}
