import { Injectable, EventEmitter } from '@angular/core';
import { QuestionService } from '../question/question.service';
import { Config } from '../../config.model';
import { StorageService } from '../storage/storage.service';

export const CHECK_TIMEOUT_EVENT = 'CHECK_TIMEOUT_EVENT';

/**
 * TimerService: this service imposes an overall time limit on completing the check. The time allowed is provided in the config via the
 * `checkTime` property which is the number of minutes allowed overall to complete the check.
 *
 * This forces checks taken with the `next` button to complete in a certain time.
 *
 * Control flow code can subscribe to the `emitter` property and watch for the `CHECK_TIMEOUT_EVENT` which happens on timeout.
 */

@Injectable()
export class TimerService {
    public readonly emitter: EventEmitter<string> = new EventEmitter();

    private _timeRemaining: number;
    private checkStartTime: number;
    private interval: any;
    private config: Config;

    constructor(private questionService: QuestionService, private storageService: StorageService) {
        this.config = this.questionService.getConfig();
    }

    public get timeRemaining(): number {
        return this._timeRemaining;
    }

    private calculateCheckTimeRemaining(): void {
        const checkTimeLimit = ((this.config.checkTime || 30) * 1000) * 60;
        this._timeRemaining = checkTimeLimit - (new Date().getTime() - this.checkStartTime);
        if (this._timeRemaining <= 0) {
            clearInterval(this.interval);
            this._timeRemaining = 0;
            this.emitter.emit(CHECK_TIMEOUT_EVENT);
        }
    }

    public startCheckTimer() {
        if (this.interval) {
            return;
        }
        const storedStartTime = this.storageService.getCheckStartTime();
        if (!storedStartTime) {
            this.checkStartTime = new Date().getTime();
            this.storageService.setCheckStartTime(this.checkStartTime);
        } else {
            this.checkStartTime = parseInt(storedStartTime, 10);
        }
        this.calculateCheckTimeRemaining();
        this.interval = setInterval(() => {
            this.calculateCheckTimeRemaining();
        }, 1000);
    }

    public stopCheckTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    public clearStartTime() {
        this.checkStartTime = 0;
        this.storageService.removeCheckStartTime();
    }
}
