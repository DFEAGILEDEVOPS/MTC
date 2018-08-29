import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';

import { FamiliarisationAreaComponent } from './familiarisation-area.component';

describe('FamiliarisationAreaComponent', () => {
  let mockRouter;
  let mockStorageService;
  let component: FamiliarisationAreaComponent;
  let fixture: ComponentFixture<FamiliarisationAreaComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationAreaComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useClass: StorageServiceMock }
      ]
    });

    mockStorageService = injector.get(StorageService);
    spyOn(mockStorageService, 'getItem').and.returnValue({ firstName: 'a', lastName: 'b' });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliarisationAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
