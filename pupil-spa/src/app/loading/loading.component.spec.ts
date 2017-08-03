import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {Router} from '@angular/router';

import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let mockRouter;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      declarations: [ LoadingComponent ],
      providers: [
        {provide: Router, useValue: mockRouter, question: 1,total: 3, timeout: 3}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  it(' will not redirect to warm up question page before timeout', () => {
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['warm-up-question'])
  });

  it('redirects to warm up question page after initial timeout', () => {
    setTimeout(function() {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['warm-up-question'])
    }, 1000);
  });
});
