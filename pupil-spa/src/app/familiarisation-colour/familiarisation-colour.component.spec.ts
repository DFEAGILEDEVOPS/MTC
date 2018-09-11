import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { FamiliarisationColourComponent } from './familiarisation-colour.component';

describe('FamiliarisationColourComponent', () => {
  let mockRouter;
  let component: FamiliarisationColourComponent;
  let fixture: ComponentFixture<FamiliarisationColourComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationColourComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliarisationColourComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the sign-in-success page on click', () => {
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
    });
  });
});
