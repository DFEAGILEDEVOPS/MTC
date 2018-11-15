import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { AuditService } from '../services/audit/audit.service';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { AccessArrangements } from '../access-arrangements';
import { AzureQueueSubmissionService } from '../services/azure-queue-submission/azure-queue-submission';
import { FamiliarisationColourComponent } from './familiarisation-colour.component';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { RouteService } from '../services/route/route.service';
import { RouteServiceMock } from '../services/route/route.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { TokenService } from '../services/token/token.service';

describe('FamiliarisationColourComponent', () => {
  let azureQueueSubmissionService: AzureQueueSubmissionService;
  let mockRouter;
  let mockRouteService;
  let mockStorageService;
  let component: FamiliarisationColourComponent;
  let fixture: ComponentFixture<FamiliarisationColourComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [FamiliarisationColourComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: RouteService, useClass: RouteServiceMock},
        {provide: StorageService, useClass: StorageServiceMock},
        {provide: QUEUE_STORAGE_TOKEN},
        AuditService,
        AzureQueueService,
        AzureQueueSubmissionService,
        TokenService
      ]
    });

    mockRouteService = injector.get(RouteService);
    mockStorageService = injector.get(StorageService);
    azureQueueSubmissionService = injector.get(AzureQueueSubmissionService);
  }));
  describe('when config does not include existing colour contrast selection', () => {
    beforeEach(() => {
      spyOn(mockStorageService, 'getItem').and.returnValue({checkCode: 'checkCode'});
      spyOn(mockStorageService, 'setItem');
      fixture = TestBed.createComponent(FamiliarisationColourComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should expect the component to exist', () => {
      expect(component).toBeTruthy();
    });

    it('should set the colour contrast to default value (bow) if it is not detected in the config', () => {
      expect(mockStorageService.getItem).toHaveBeenCalledTimes(2);
      const accessArrangements = new AccessArrangements();
      accessArrangements.contrast = 'bow';
      expect(mockStorageService.setItem).toHaveBeenCalledWith('access_arrangements', accessArrangements);

    });

    it('should redirect to the access-settings page on click if the user has navigated from access-settings', () => {
      spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/access-settings');
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
      });
    });

    it('should redirect to the sign-in-success page on click if the user has not navigated from access-settings', () => {
      spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/something-else');
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
      });
    });

    it('should redirect to the sign-in-success page on click if previous url is undefined', () => {
      spyOn(mockRouteService, 'getPreviousUrl').and.returnValue(undefined);
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
      });
    });
    it('should call pupil prefs azure queue storage', async () => {
      spyOn(azureQueueSubmissionService, 'submitAzureQueueMessage');
      spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/something-else');
      await component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
        expect(mockStorageService.getItem).toHaveBeenCalled();
        expect(azureQueueSubmissionService.submitAzureQueueMessage).toHaveBeenCalled();
        expect(mockStorageService.setItem).toHaveBeenCalled();
      });
    });
  });
  describe('when config includes existing colour contrast selection', () => {
    beforeEach(async(() => {
      spyOn(mockStorageService, 'getItem').and.callFake((arg) => {
        if (arg === 'pupil') {
          return {firstName: 'a', lastName: 'b', checkCode: 'checkCode'};
        }
        if (arg === 'config') {
          return {colourContrastCode: 'BOB'};
        }
      });
      spyOn(mockStorageService, 'setItem');
      fixture = TestBed.createComponent(FamiliarisationColourComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));
    it('should set the colour contrast in the current component', () => {
      const accessArrangements = new AccessArrangements();
      accessArrangements.contrast = 'bob';
      expect(mockStorageService.setItem.calls.all()[0].args[1]).toEqual(accessArrangements);
    });
  });
});
