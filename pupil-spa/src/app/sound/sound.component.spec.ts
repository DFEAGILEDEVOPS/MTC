import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundComponent } from './sound.component';

describe('SoundComponent', () => {
  let component: SoundComponent;
  let fixture: ComponentFixture<SoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has a function to play the end of question sound', () => {
    expect(typeof component.playEndOfQuestionSound).toBe('function');
  });

  it('has a function to play an alert that the time is nearly up', () => {
    expect(typeof component.playTimeRunningOutAlertSound).toBe('function');
  });

  it('should have two audio elements', () => {
    const el: HTMLElement = fixture.nativeElement;
    const audioElements = el.querySelectorAll('audio');
    expect(audioElements.length).toBe(2);
  });
});
