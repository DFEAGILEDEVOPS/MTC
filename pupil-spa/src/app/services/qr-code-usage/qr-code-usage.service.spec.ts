import { TestBed } from '@angular/core/testing';

import { QrCodeUsageService } from './qr-code-usage.service';
import { IStorageService, StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/mock-storage.service';
import { AuditService } from '../audit/audit.service';

describe('QrCodeUsageService', () => {
  let service: QrCodeUsageService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: AuditService, useClass: AuditService },
      ]
    });
    service = TestBed.inject(QrCodeUsageService);
    storageService = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  })

  it('qrCodeSubsequentAppUsageIfNeeded() should store the current date and time', () => {
    // setup
    service['_appWasOpenedUsingQrCode'] = true
    spyOn(service, 'qrCodeSubsequentAppUsageIfNeeded').and.callThrough()
    service.qrCodeSubsequentAppUsageIfNeeded()
    expect(service['qrCodeSubsequentAppUses'].length).toBeGreaterThan(0)
  })

  describe('storeToLocalStorage', () => {
    beforeEach(() => {
      // set up some test data
      service.qrCodeArrival()
      service.qrCodeSubsequentAppUsageIfNeeded()
      service.qrCodeSubsequentAppUsageIfNeeded()
      spyOn(storageService, 'setAuditEntry').and.callThrough()
    })

    it('it should call auditService.addEntry for each usage', () => {
      service.storeToLocalStorage()
      expect(storageService.setAuditEntry).toHaveBeenCalledTimes(3)
      expect(storageService.getAllItems().audits.length).toBe(3)
    })
  })

  describe('qrCodeArrival', () => {
   it('stores the current date and time', () => {
    spyOn(service, 'qrCodeArrival').and.callThrough()
    service.qrCodeArrival()
    expect(service['qrCodeArrivalTimestamps'].length).toBeGreaterThan(0)
    })
  })

  describe('appWasOpenedUsingQrCode()', () => {
    it('returns  if the app was opened with the QR code', () => {
      //setup
      service.qrCodeArrival()
      expect(service.appWasOpenedUsingQrCode()).toBe(true)
    })
  })
})
