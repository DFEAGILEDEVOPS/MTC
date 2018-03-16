import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckCompleteComponent } from './check-complete.component';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';

describe('CheckCompleteComponent', () => {
  let component: CheckCompleteComponent;
  let fixture: ComponentFixture<CheckCompleteComponent>;
  let storageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckCompleteComponent ],
      providers: [
        { provide: StorageService, useClass: StorageServiceMock },
        WindowRefService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCompleteComponent);
    component = fixture.componentInstance;
    storageService = fixture.debugElement.injector.get(StorageService);
  });

  it('should be created', () => {
    spyOn(storageService, 'clear');
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(storageService.clear).toHaveBeenCalledTimes(1);
  });
});
