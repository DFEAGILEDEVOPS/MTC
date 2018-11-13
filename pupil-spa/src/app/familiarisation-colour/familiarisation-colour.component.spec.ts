import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { FamiliarisationColourComponent } from './familiarisation-colour.component';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { RouteService } from '../services/route/route.service';
import { RouteServiceMock } from '../services/route/route.service.mock';
import { AuditService } from '../services/audit/audit.service';
import { TokenService } from '../services/token/token.service';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { AccessArrangements } from '../access-arrangements';

describe('FamiliarisationColourComponent', () => {
  let auditService: AuditService;
  let azureQueueService: AzureQueueService;
  let mockRouter;
  let mockRouteService;
  let mockStorageService;
  let tokenService: TokenService;
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
        TokenService
      ]
    });

    mockRouteService = injector.get(RouteService);
    mockStorageService = injector.get(StorageService);
    tokenService = injector.get(TokenService);
    auditService = injector.get(AuditService);
    azureQueueService = injector.get(AzureQueueService);
  }));
  describe('when config does not include existing colour contrast selection', () => {
    beforeEach(() => {
      spyOn(mockStorageService, 'getItem').and.returnValue({ checkCode: 'checkCode' });
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
    describe('When featureUseHpa is enabled', () => {
      beforeEach(() => {
        component.featureUseHpa = true;
      });
      it('should call pupil prefs azure queue storage', async () => {
        spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
        spyOn(azureQueueService, 'addMessage');
        spyOn(auditService, 'addEntry');
        spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/something-else');
        await component.onClick();
        fixture.whenStable().then(() => {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
          expect(auditService.addEntry).toHaveBeenCalledTimes(2);
          expect(mockStorageService.getItem).toHaveBeenCalled();
          expect(tokenService.getToken).toHaveBeenCalled();
          expect(azureQueueService.addMessage).toHaveBeenCalled();
          expect(mockStorageService.setItem).toHaveBeenCalled();
        });
      });
      it('should audit log the error when azureQueueService add Message fails', async () => {
        spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
        spyOn(azureQueueService, 'addMessage').and.returnValue(Promise.reject(new Error('error')));
        spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/something-else');
        const addEntrySpy = spyOn(auditService, 'addEntry');
        await component.onClick();
        fixture.whenStable().then(() => {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
          expect(mockStorageService.getItem).toHaveBeenCalled();
          expect(tokenService.getToken).toHaveBeenCalled();
          expect(azureQueueService.addMessage).toHaveBeenCalled();
          expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('PupilPrefsAPICallFailed');
        });
      });
    });
    describe('when featureHpa is not enabled', () => {
      beforeEach(() => {
        component.featureUseHpa = false;
      });
      it('should not call pupil prefs azure queue storage', async () => {
        spyOn(tokenService, 'getToken');
        spyOn(azureQueueService, 'addMessage');
        spyOn(auditService, 'addEntry');
        spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/something-else');
        await component.onClick();
        fixture.whenStable().then(() => {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
          expect(auditService.addEntry).not.toHaveBeenCalled();
          expect(mockStorageService.getItem).toHaveBeenCalledTimes(2);
          expect(tokenService.getToken).not.toHaveBeenCalled();
          expect(azureQueueService.addMessage).not.toHaveBeenCalled();
        });
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
