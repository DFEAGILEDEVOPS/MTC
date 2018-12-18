import { Injectable, EventEmitter } from '@angular/core';
import { QuestionService } from '../question/question.service';
import { Config } from '../../config.model';
import { StorageService } from '../storage/storage.service';

export const CHECK_TIMEOUT_EVENT = 'CHECK_TIMEOUT_EVENT';
export const TimeoutStorageKey = 'time_out';
export const StartTimeStorageKey = 'check_start_time';

@Injectable()
export class TimerService {

    public timeRemaining: number;
    public emitter: EventEmitter<string> = new EventEmitter();

    private checkStartTime: number;
    private interval: any;
    private config: Config;

    constructor(private questionService: QuestionService, private storageService: StorageService) {
        this.config = this.questionService.getConfig();
    }

    private calculateCheckTimeRemaining(): number {
        const checkTime = (this.config.checkTime * 1000) * 60;
        return checkTime - (new Date().getTime() - this.checkStartTime);
    }

    public startCheckTimer() {
        const storedStartTime = this.storageService.getItem(StartTimeStorageKey);
        if (!storedStartTime) {
            this.checkStartTime = new Date().getTime();
            this.storageService.setItem(StartTimeStorageKey, this.checkStartTime);
        } else {
            this.checkStartTime = parseInt(storedStartTime, 10);
        }

        this.timeRemaining = this.calculateCheckTimeRemaining();
        this.interval = setInterval(() => {
            this.timeRemaining = this.calculateCheckTimeRemaining();
            if (this.timeRemaining <= 0) {
                clearInterval(this.interval);
                this.timeRemaining = 0;
                this.emitter.emit(CHECK_TIMEOUT_EVENT);
            }
        }, 1000);
    }

    public stopCheckTimer() {
        clearInterval(this.interval);
    }

    public clearStartTime() {
        this.checkStartTime = 0;
        this.storageService.removeItem(StartTimeStorageKey);
    }
}
