import { TestBed } from '@angular/core/testing';
import { AppUsageService } from './app-usage.service';

let appUsageService: AppUsageService;

describe('AppUsageService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
        providers: [
          AppUsageService,
        ]
      }
    );
    appUsageService = inject.get(AppUsageService);
  });
  it('should be created', () => {
    expect(appUsageService).toBeTruthy();
  });
  describe('#getCounterValue', () => {
    it('should fetch the app usage counter value', () => {
      const counter = appUsageService.getCounterValue();
      expect(counter).toBe(0);
    });
  });
  describe('#increment', () => {
    it('should increment the app usage counter by 1', () => {
      appUsageService.increment();
      const counter = appUsageService.getCounterValue();
      expect(counter).toBe(1);
    });
  });
});
