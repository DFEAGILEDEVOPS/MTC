import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupIntroComponent } from './warmup-intro.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WarmupIntroRendered, AuditEntry } from '../services/audit/auditEntry';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('WarmupIntroComponent', () => {
  let component: WarmupIntroComponent;
  let fixture: ComponentFixture<WarmupIntroComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ WarmupIntroComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: AuditService, useClass: AuditServiceMock},
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        WindowRefService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('emits onClick()', async ((done) => {
    component.clickEvent.subscribe( g => {
      expect(g).toBe(null);
      // Issue: https://github.com/angular/angular/issues/15830
      // done();
    });
    component.onClick();
  }));

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    let auditService;
    beforeEach(() => {
      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('is added on WarmupIntro rendered', () => {
      component.ngAfterViewInit();
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof WarmupIntroRendered).toBeTruthy();
    });
  });
});
