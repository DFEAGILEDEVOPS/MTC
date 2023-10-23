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
export class UserService {
  private loggedIn = false;
  data: any = {};

  constructor(private http: HttpService,
    private storageService: StorageService,
    private metaService: Meta,
    private auditEntryFactory: AuditEntryFactory,
    private auditService: AuditService) {
    this.loggedIn = !!this.storageService.getAccessArrangements();
  }

  login(schoolPin: string, pupilPin: string): Promise<any> {
    const buildTag = this.metaService.getTag('name="build:number"')
    const buildVersion = buildTag.content
    return new Promise(async (resolve, reject) => {
      await this.http.postJson(`${APP_CONFIG.apiBaseUrl}/auth`, { schoolPin, pupilPin, buildVersion })
        .then(data => {
          this.loggedIn = true;
          this.storageService.clear();
          // Create a login success event in the audit trail
          this.auditService.addEntry(
            this.auditEntryFactory.createLoginSuccessAuditEntryClass()
          )
          // Store other info to local storage, ready to be sent back in the payload
          this.storageService.setQuestions(data[questionsStorageKey.toString()]);
          this.storageService.setConfig(data[configStorageKey.toString()]);
          this.storageService.setPupil(data[pupilStorageKey.toString()]);
          this.storageService.setSchool(data[schoolStorageKey.toString()]);
          this.storageService.setToken(data[tokensStorageKey.toString()]);
          resolve(true);
        },
        (err) => {
          reject(err);
        }).catch(error => reject(error));
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
