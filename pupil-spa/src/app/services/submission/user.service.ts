import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { Meta } from '@angular/platform-browser';
import { HttpService } from '../http/http.service';
import { StorageService } from '../storage/storage.service';
import {
  ConfigStorageKey,
  PupilStorageKey,
  QuestionsStorageKey,
  SchoolStorageKey, TokensStorageKey
} from '../storage/storageKey';
import { AuditEntryFactory } from '../audit/auditEntry';
import { AuditService } from '../audit/audit.service';

const questionsStorageKey = new QuestionsStorageKey();
const configStorageKey = new ConfigStorageKey();
const pupilStorageKey = new PupilStorageKey();
const schoolStorageKey = new SchoolStorageKey();
const tokensStorageKey = new TokensStorageKey();

@Injectable()
export class SubmissionService {
  private loggedIn = false;
  data: any = {};

  constructor(private http: HttpService,
    private storageService: StorageService,
    private metaService: Meta,
    private auditEntryFactory: AuditEntryFactory,
    private auditService: AuditService) {
    this.loggedIn = !!this.storageService.getAccessArrangements();
  }

  submit(payload: object): Promise<any> {
    return this.http.postJson(`${APP_CONFIG.authURL}`, { payload })
      .then(data => {
        this.loggedIn = true;
        this.storageService.clear();

        // Create a login success event in the audit trail
        this.auditService.addEntry(
          this.auditEntryFactory.createLoginSuccessAuditEntryClass()
        );

        // Store other info to local storage, ready to be sent back in the payload
        this.storageService.setQuestions(data[questionsStorageKey.toString()]);
        this.storageService.setConfig(data[configStorageKey.toString()]);
        this.storageService.setPupil(data[pupilStorageKey.toString()]);
        this.storageService.setSchool(data[schoolStorageKey.toString()]);
        this.storageService.setToken(data[tokensStorageKey.toString()]);

        return true;
      });
  }

  logout() {
    this.storageService.clear();
    this.loggedIn = false;
  }

  isLoggedIn() {
    return this.loggedIn;
  }
}
