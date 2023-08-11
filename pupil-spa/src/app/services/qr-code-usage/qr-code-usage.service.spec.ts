import { TestBed } from '@angular/core/testing';

import { QrCodeUsageService } from './qr-code-usage.service';
import { StorageService } from '../storage/storage.service';
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

  afterEach(() => {
    storageService.clear()
  })

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
      service.closeQrCodeArrivalSession() // first user
      service.qrCodeSubsequentAppUsageIfNeeded() // second user
      service.qrCodeSubsequentAppUsageIfNeeded() // third user
      spyOn(storageService, 'setAuditEntry').and.callThrough()
    })

    it('it should call auditService.addEntry for each usage', () => {
      service.storeToLocalStorage()
      expect(storageService.setAuditEntry).toHaveBeenCalledTimes(3)
      expect(Object.keys(storageService.getAllItems()).length).toBe(3)
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

  describe('initialiseFromLocalStorage', () => {
    beforeEach(() => {
      // set up some test data
      service.qrCodeArrival()
      service.closeQrCodeArrivalSession() // first user
      service.qrCodeSubsequentAppUsageIfNeeded() // second user
      service.qrCodeSubsequentAppUsageIfNeeded() // third user
      service.storeToLocalStorage()
    })

    it('reloads qrCodeArrivalTimestamps when initialiseFromLocalStorage() is called', () => {
      // store the values in memory for later comparision
      const origQrArrivalDtos = service['qrCodeArrivalTimestamps'].map(a => a.getDto())

      // reset the service to mimic a page reload and service reinitialisation
      service._utilReset()
      service.initialiseFromLocalStorage()

      // Compare the new state with the previous state from before the reset. We can't just compare the raw objects as the split between
      // timeOrigin and now is lost in the DTO object conversion which adds these params.
      const reloadedDtos = service['qrCodeArrivalTimestamps'].map(a => a.getDto())
      expect(reloadedDtos).toEqual(origQrArrivalDtos)
    })

    it('reloads qrCodeSubsequentAppUsages when initialiseFromLocalStorage() is called', () => {
      // store the values in memory for later comparision
      const origQrSubsequentDtos = service['qrCodeSubsequentAppUses'].map(a => a.getDto())

      // reset the service to mimic a page reload and service reinitialisation
      service._utilReset()
      service.initialiseFromLocalStorage()

      const reloadedSubsequentDtos = service['qrCodeSubsequentAppUses'].map(a => a.getDto())
      expect(reloadedSubsequentDtos).toEqual(origQrSubsequentDtos)
    })

    it('restores the _appWasOpenedUsingQrCode variable', () => {
      // reset the service to mimic a page reload and service reinitialisation
      service._utilReset()
      service.initialiseFromLocalStorage()

      expect(service['_appWasOpenedUsingQrCode']).toBe(true)
    })
  })
})
