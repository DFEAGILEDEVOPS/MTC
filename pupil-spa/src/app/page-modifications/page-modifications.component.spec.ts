import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';

import { PageModificationsComponent } from './page-modifications.component';

describe('PageModificationsComponent', () => {
  let mockRouter;
  let mockStorageService;
  let component: PageModificationsComponent;
  let fixture: ComponentFixture<PageModificationsComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ PageModificationsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useClass: StorageServiceMock }
      ]
    });

    mockStorageService = injector.get(StorageService);
    spyOn(mockStorageService, 'getItem').and.returnValue({ fontSize: 'xlarge' });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageModificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the font-size', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('div#page-modifications').className).toContain('copy-size-xlarge');
  });
});
