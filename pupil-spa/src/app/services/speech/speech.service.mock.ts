import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SpeechServiceMock {
  public static readonly speechStarted = 'start';
  public static readonly speechEnded = 'end';
  public static readonly speechReset = 'clear';
  public static readonly questionSpeechStarted = 'questionstart';
  public static readonly questionSpeechEnded = 'questionend';
  public speechStatusSource = new Subject<string>();

  // Observable string stream
  public speechStatus = this.speechStatusSource.asObservable();

  constructor() {
    this.speechStatusSource.next(SpeechServiceMock.speechReset);
  }

  cancel () {
  }

  speak (arg) {
    this.speechStatusSource.next(SpeechServiceMock.speechEnded);
  }

  speakQuestion (arg) {
    this.speechStatusSource.next(SpeechServiceMock.questionSpeechEnded);
  }

  speakFocusedElement (arg) {
    this.speechStatusSource.next(SpeechServiceMock.speechEnded);
  }

  speakElement (arg) {}
}
