import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SpeechServiceMock {
  private speechStatusSource = new Subject<string>();
  // Observable string stream
  public speechStatus = this.speechStatusSource.asObservable();

  cancel () {
  }

  speak (arg) {
    this.speechStatusSource.next('end');
  }
}
