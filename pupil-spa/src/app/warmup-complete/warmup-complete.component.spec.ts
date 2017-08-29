import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupCompleteComponent } from './warmup-complete.component';

describe('WarmupCompleteComponent', () => {
  let component: WarmupCompleteComponent;
  let fixture: ComponentFixture<WarmupCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarmupCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
