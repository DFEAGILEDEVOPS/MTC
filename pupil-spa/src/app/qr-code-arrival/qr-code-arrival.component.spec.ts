import { QrCodeArrivalComponent } from './qr-code-arrival.component';

describe('QrCodeArrivalComponent', () => {
  let sut: QrCodeArrivalComponent;
  let mockRouter;
  let mockAppInsightsService;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    }
    mockAppInsightsService = {
      trackPageView: jasmine.createSpy('trackPageView')
    }
    sut = new QrCodeArrivalComponent(mockRouter, mockAppInsightsService)
  })

  it('should track requests to the qr code URL', () => {
    sut.ngOnInit();
    expect(mockAppInsightsService.trackPageView).toHaveBeenCalledOnceWith('QR code', '/qr')
  })
})
