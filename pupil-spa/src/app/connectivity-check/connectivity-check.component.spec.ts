import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { ConnectivityCheckComponent } from './connectivity-check.component';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { CheckStatusServiceMock } from '../services/check-status/check-status.service.mock';
import { ConnectivityService } from '../services/connectivity-service/connectivity-service';
import { DeviceService } from '../services/device/device.service';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { Router } from '@angular/router';

describe('ConnectivityCheckComponent', () => {
  let component: ConnectivityCheckComponent;
  let fixture: ComponentFixture<ConnectivityCheckComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let mockRouter;
  let hasUnfinishedCheckSpy;
  let checkStatusService;
  let connectivityService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      schemas: [ NO_ERRORS_SCHEMA ],
      declarations: [ ConnectivityCheckComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        AzureQueueService,
        { provide: CheckStatusService, useClass: CheckStatusServiceMock },
        ConnectivityService,
        DeviceService,
        StorageService,
        WindowRefService,
        { provide: QUEUE_STORAGE_TOKEN, useValue: undefined },
        { provide: Router, useValue: mockRouter },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectivityCheckComponent);
    component = fixture.componentInstance;
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    checkStatusService = TestBed.get(CheckStatusService);
    connectivityService = TestBed.get(ConnectivityService);
    hasUnfinishedCheckSpy = spyOn(checkStatusService, 'hasUnfinishedCheck');
    hasUnfinishedCheckSpy.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should navigate to check path with query params if an unfinished check is detected', async () => {
      hasUnfinishedCheckSpy.and.returnValue(true);
      await component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['check'], { queryParams: { unfinishedCheck: true } });
    });
    it('should not navigate to check path if a completed check is detected', async () => {
      spyOn(connectivityService, 'connectivityCheckSucceeded').and.returnValue(true);
      await component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sign-in']);
    });
    it('should navigate to sign in view if connectivity Check succeeded', async () => {
      spyOn(connectivityService, 'connectivityCheckSucceeded').and.returnValue(true);
      spyOn(component, 'displayMinTime');
      await component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sign-in']);
    });
    it('should navigate to connectivity error view if connectivity Check fails', async () => {
      spyOn(connectivityService, 'connectivityCheckSucceeded').and.returnValue(false);
      spyOn(component, 'displayMinTime');
      await component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/connectivity-error']);
    });
  });
});
