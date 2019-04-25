import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceUserInteractionComponent } from './force-user-interaction.component';

describe('ForceUserInteractionComponent', () => {
  let component: ForceUserInteractionComponent;
  let fixture: ComponentFixture<ForceUserInteractionComponent>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForceUserInteractionComponent]
    })
      .compileComponents();
  }));
  
  beforeEach(() => {
    fixture = TestBed.createComponent(ForceUserInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
