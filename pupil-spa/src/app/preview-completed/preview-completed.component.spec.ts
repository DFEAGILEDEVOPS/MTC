import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PreviewCompletedComponent } from './preview-completed.component';
import { StorageService } from '../services/storage/storage.service';

describe('PreviewCompletedComponent', () => {
  let component: PreviewCompletedComponent;
  let fixture: ComponentFixture<PreviewCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewCompletedComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        StorageService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: {
            get: () => {
              return 'true';
            }
          } } }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
