import { TestBed, inject } from '@angular/core/testing';

import { SpeechService } from './speech.service';
import { AuditService } from '../audit/audit.service';
import { AuditServiceMock } from '../audit/audit.service.mock';



describe('SpeechService', () => {
  const auditServiceMock = new AuditServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SpeechService,
        { provide: AuditService, useValue: auditServiceMock }
      ]
    });
  });

  it('should be created', inject([SpeechService], (service: SpeechService) => {
    expect(service).toBeTruthy();
  }));

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

    it('calls the audit service on start and end', inject([SpeechService], (service: SpeechService) => {
      spyOn(auditServiceMock, 'addEntry').and.callThrough();
      // We need to mock out the actual speech interface, as otherwise this test will emit speech
      spyOn(window.speechSynthesis, 'speak').and.callFake((utterance) => {
        // call the onstart and onend function if they exist
        if (utterance.onstart && typeof utterance.onstart === 'function') {
          utterance.onstart();
        }
        if (utterance.onend && typeof utterance.onend === 'function') {
          utterance.onend();
        }
      });
      service.speak('9 times 9');
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(2);
    }));
  });
});
