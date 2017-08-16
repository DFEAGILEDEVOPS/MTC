import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualKeyboardComponent } from './virtual-keyboard.component';

describe('VirtualKeyboardComponent', () => {
  let component: VirtualKeyboardComponent;
  let fixture: ComponentFixture<VirtualKeyboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualKeyboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualKeyboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have a buttons with values from 0 to 9', () => {
    const compiled = fixture.debugElement.nativeElement;
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(num) {
      expect(compiled.querySelector('td.key.js-key > button#kb' + num).textContent).toMatch(
        num.toString()
      );
    });
  });

  it('should have a Backspace button', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('td.key.js-key > button#kb-backspace')).toBeTruthy();
  });

  it('should have an Enter button', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('td.enter-key.js-key > button#kb-enter')).toBeTruthy();
  });

  xit('should clicking buttons populate the Answers box', () => {
    const compiled = fixture.debugElement.nativeElement;
    component.onClickAnswer(1);
    expect(compiled.querySelector('span#js-answer').innerHTML).toContain('1');
  });
});
