import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {Router} from '@angular/router';

import { WarmupIntroComponent } from './warmup-intro.component';

describe('WarmupIntroComponent', () => {
  let component: WarmupIntroComponent;
  let fixture: ComponentFixture<WarmupIntroComponent>;
  let mockRouter;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      declarations: [ WarmupIntroComponent ],
      providers: [
        {provide: Router, useValue: mockRouter}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to loading screen', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['warm-up-start']);
  });
});
