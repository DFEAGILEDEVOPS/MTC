import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupIntroComponent } from './warmup-intro.component';

describe('WarmupIntroComponent', () => {
  let component: WarmupIntroComponent;
  let fixture: ComponentFixture<WarmupIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarmupIntroComponent ]
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
});
