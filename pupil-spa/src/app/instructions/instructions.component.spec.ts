import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {Router} from '@angular/router';

import { InstructionsComponent } from './instructions.component';
import { QuestionServiceMock } from '../question.service.mock';
import { QuestionService } from '../question.service';

describe('InstructionsComponent', () => {
  let component: InstructionsComponent;
  let fixture: ComponentFixture<InstructionsComponent>;
  let mockRouter;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    TestBed.configureTestingModule({
      declarations: [InstructionsComponent],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: QuestionService, useClass: QuestionServiceMock}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() =>
    fixture = TestBed.createComponent(InstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to warm up introduction page', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['check']);
  });
});
