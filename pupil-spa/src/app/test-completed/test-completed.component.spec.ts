import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestCompletedComponent } from './test-completed.component';

describe('TestCompletedComponent', () => {
  let component: TestCompletedComponent;
  let fixture: ComponentFixture<TestCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCompletedComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: {
            get: () => {
              return 'true';
            }
          } } }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
