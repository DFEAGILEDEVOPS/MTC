import { EventEmitter } from '@angular/core';

export class TimerServiceMock {

    public timeRemaining = 15000000;
    public emitter: EventEmitter<string> = new EventEmitter();

    constructor() {
    }

    startCheckTimer() {
    }

    stopCheckTimer() {
    }
}
