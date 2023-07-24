import { QrCodeArrivalComponent } from './qr-code-arrival.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { Router } from '@angular/router';
import { QrCodeUsageService } from '../services/qr-code-usage/qr-code-usage.service';
import { StorageServiceMock } from '../services/storage/mock-storage.service';
import { StorageService } from '../services/storage/storage.service';
import { ApplicationInsightsService } from '../services/app-insights/app-insights.service';
import { AuditService } from '../services/audit/audit.service';
describe('QrCodeArrivalComponent', () => {
  let sut: QrCodeArrivalComponent;
  let mockRouter;
  let mockAppInsightsService;
  let fixture: ComponentFixture<QrCodeArrivalComponent>;
  let qrCodeUsageService: QrCodeUsageService;
  let qrCodeArrivalTimestampsSpy: jasmine.Spy

  beforeEach(waitForAsync(() => {
    mockRouter = { navigate: jasmine.createSpy('navigate') }
    mockAppInsightsService = {
      trackPageView: jasmine.createSpy('trackPageView')
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ApplicationInsightsService, useValue: mockAppInsightsService },
        { provide: QrCodeUsageService, useClass: QrCodeUsageService },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: AuditService, useClass: AuditService } // original
      ]
    }).compileComponents().catch(error => {
      console.error(error)
    });

    qrCodeUsageService = TestBed.inject(QrCodeUsageService)
    spyOn(qrCodeUsageService, 'qrCodeArrival')
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeArrivalComponent)
    sut = fixture.componentInstance
  });

  it('should track requests to the qr code URL', () => {
    sut.ngOnInit();
    expect(mockAppInsightsService.trackPageView).toHaveBeenCalledOnceWith('QR code', '/qr')
  })

  it('should should register the qrCode arrival', () => {
    sut.ngOnInit();
    expect(qrCodeUsageService.qrCodeArrival).toHaveBeenCalled()
  })
})
