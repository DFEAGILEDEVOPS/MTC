import { TestBed } from '@angular/core/testing';

import { QrCodeUsageService } from './qr-code-usage.service';
import { StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/mock-storage.service';

describe('QrCodeUsageService', () => {
  let service: QrCodeUsageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useClass: StorageServiceMock }
      ]
    });
    service = TestBed.inject(QrCodeUsageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  })

  it('qrCodeArrival() should store the current date and time', () => {
    spyOn(service, 'qrCodeArrival').and.callThrough()
    service.qrCodeArrival()
    expect(service['qrCodeArrivalTimestamps'].length).toBeGreaterThan(0)
  })

  it('qrCodeSubsequentAppUsage() should store the current date and time', () => {
    spyOn(service, 'qrCodeSubsequentAppUsage').and.callThrough()
    service.qrCodeSubsequentAppUsage()
    expect(service['qrCodeSubsequentAppUses'].length).toBeGreaterThan(0)
  })
});
