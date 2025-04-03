import { TestBed, inject } from '@angular/core/testing';

import { SpeechService } from './speech.service';
import { AuditService } from '../audit/audit.service';
import { AuditServiceMock } from '../audit/audit.service.mock';
import { WindowRefService } from '../window-ref/window-ref.service';
import { AuditEntryFactory } from '../audit/auditEntry'

describe('SpeechService', () => {
  const auditServiceMock = new AuditServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SpeechService,
        { provide: AuditService, useValue: auditServiceMock },
        WindowRefService,
        AuditEntryFactory
      ]
    });
  });

  describe('constructor', () => {
    beforeEach(() => {
      spyOn(window, 'addEventListener');
      spyOn(console, 'log')
    });

    it('should be created', inject([SpeechService], (service: SpeechService) => {
      expect(service).toBeTruthy();
      expect(window.addEventListener).toHaveBeenCalledTimes(2);
    }));
  });

  describe('#removeAutoplayRestrictions', () => {
    beforeEach(() => {
      spyOn(window, 'addEventListener').and.callFake((event, fun) => fun());
      spyOn(window, 'removeEventListener');
    });

    it('should remove its event listeners', inject([SpeechService], (service: SpeechService) => {
      expect(window.removeEventListener).toHaveBeenCalledTimes(2 * 2);
    }));
  });

  describe('#isSupported', () => {
    it('returns true if the api is supported', inject([SpeechService], (service: SpeechService) => {
      // Assumes the browser can handle it
      expect(service.isSupported()).toBe(true);
    }));

    it('returns false if the api is NOT supported', inject([SpeechService], (service: SpeechService) => {
      service['synth'] = undefined;
      expect(service.isSupported()).toBe(false);
    }));
  });

  describe ('#speak', () => {
    it('should have a speak method', inject([SpeechService], (service: SpeechService) => {
      expect(typeof service.speak).toBe('function');
    }));

    it('calls the audit service on start and end', inject([SpeechService], async (service: SpeechService) => {
      spyOn(auditServiceMock, 'addEntry').and.callThrough();
      // Mock the setTimeout method to get the results instantly
      // @ts-ignore
      spyOn(window, 'setTimeout').and.callFake( (fun, time) => {
        // @ts-ignore
        fun();
      });
      // We need to mock out the actual speech interface, as otherwise this test will emit speech
      spyOn(window.speechSynthesis, 'speak').and.callFake((utterance: SpeechSynthesisUtterance) => {
        // call the onstart and onend function if they exist
        if (utterance.onstart && typeof utterance.onstart === 'function') {
          utterance.onstart(null);
        }
        if (utterance.onend && typeof utterance.onend === 'function') {
          utterance.onend(null);
        }
      });
      await service.speak('9 times 9');
      expect(window.setTimeout).toHaveBeenCalledTimes(1);
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(2);
      expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    }));
  });

  describe ('#speakQuestion', () => {
    it('should have a speakQuestion method', inject([SpeechService], (service: SpeechService) => {
      expect(typeof service.speakQuestion).toBe('function');
    }));

    it('calls the audit service on start and end', inject([SpeechService], async (service: SpeechService) => {
      spyOn(auditServiceMock, 'addEntry').and.callThrough();
      // Mock the setTimeout method to get the results instantly
      // @ts-ignore
      spyOn(window, 'setTimeout').and.callFake((fun, time) => {
        // @ts-ignore
        fun();
      });
      // We need to mock out the actual speech interface, as otherwise this test will emit speech
      spyOn(window.speechSynthesis, 'speak').and.callFake((utterance: SpeechSynthesisUtterance) => {
        // call the onstart and onend function if they exist
        if (utterance.onstart && typeof utterance.onstart === 'function') {
          utterance.onstart(null);
        }
        if (utterance.onend && typeof utterance.onend === 'function') {
          utterance.onend(null);
        }
      });
      await service.speak('9 times 9');
      expect(window.setTimeout).toHaveBeenCalledTimes(1);
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(2);
      expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    }));
  });
});
