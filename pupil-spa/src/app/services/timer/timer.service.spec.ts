import { TestBed, inject } from '@angular/core/testing';

import { TimerService, CHECK_TIMEOUT_EVENT } from './timer.service';
import { AuditServiceMock } from '../audit/audit.service.mock';
import { WindowRefService } from '../window-ref/window-ref.service';
import { QuestionService } from '../question/question.service';
import { QuestionServiceMock } from '../question/question.service.mock';

describe('TimerService', () => {

    let service: TimerService;
    let mockQuestionService = {
        getConfig: () => ({checkTime: -100})
    };

    beforeEach(() => {

        const injector = TestBed.configureTestingModule({
            providers: [
                TimerService,
                {provide: QuestionService, useValue: mockQuestionService },
                WindowRefService,
            ]
        });

        service = injector.get(TimerService);
        mockQuestionService = injector.get(QuestionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.timeRemaining).toBeUndefined();
    });

    it('should start the timer and set time remaining', () => {
        spyOn(window, 'setInterval').and.callThrough();
        service.startCheckTimer();
        expect(service.timeRemaining).toBe(-100);
        expect(window.setInterval).toHaveBeenCalledTimes(1);
        service.stopCheckTimer();
    });

    it('should stop the timer and clear the interval', () => {
        spyOn(window, 'clearInterval').and.callThrough();
        service.startCheckTimer();
        service.stopCheckTimer();
        expect(window.clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should start the timer and emit timeout event', async () => {
        service.emitter.emit = jasmine.createSpy('emit');
        service.startCheckTimer();
        const wait = () => {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 1010);
            });
        };
        await wait();
        expect(service.emitter.emit).toHaveBeenCalledWith(CHECK_TIMEOUT_EVENT);
        service.stopCheckTimer();
    });
});
