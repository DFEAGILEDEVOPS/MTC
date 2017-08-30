import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupIntroComponent } from './warmup-intro.component';

describe('WarmupIntroComponent', () => {
  let component: WarmupIntroComponent;
  let fixture: ComponentFixture<WarmupIntroComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ WarmupIntroComponent ],
      providers: []
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

  it('emits onClick()', async ((done) => {
    component.clickEvent.subscribe( g => {
      expect(g).toBe(null);
      // Issue: https://github.com/angular/angular/issues/15830
      // done();
    });
    component.onClick();
  }));
});
