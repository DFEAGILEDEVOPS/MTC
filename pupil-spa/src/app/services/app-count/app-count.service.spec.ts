import { TestBed } from '@angular/core/testing';
import { AppCountService } from './app-count.service';

let appCountService: AppCountService;

describe('AppCountService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
        providers: [
          AppCountService,
        ]
      }
    );
    appCountService = inject.get(AppCountService);
  });
  it('should be created', () => {
    expect(appCountService).toBeTruthy();
  });
  describe('#getCounterValue', () => {
    it('should fetch the app usage counter value', () => {
      const counter = appCountService.getCounterValue();
      expect(counter).toBe(0);
    });
  });
  describe('#increment', () => {
    it('should increment the app usage counter by 1', () => {
      appCountService.increment();
      const counter = appCountService.getCounterValue();
      expect(counter).toBe(1);
    });
  });
  describe('#reset', () => {
    it('should reset the app usage counter back to 0', () => {
      appCountService.increment();
      appCountService.reset();
      const counter = appCountService.getCounterValue();
      expect(counter).toBe(0);
    });
  });
});
