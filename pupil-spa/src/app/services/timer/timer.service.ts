import { Injectable, EventEmitter } from '@angular/core';
import { QuestionService } from '../question/question.service';
import { Config } from '../../config.model';

export const CHECK_TIMEOUT_EVENT = 'CHECK_TIMEOUT_EVENT';

@Injectable()
export class TimerService {

    public timeRemaining: number;
    public emitter: EventEmitter<string> = new EventEmitter();

    private checkStartTime: number;
    private interval: any;
    private config: Config;


    constructor(private questionService: QuestionService) {
        this.config = this.questionService.getConfig();
    }

    private calculateCheckTimeRemaining(): number {
        const checkTime = (this.config.checkTime * 1000) * 60;
        return checkTime - (new Date().getTime() - this.checkStartTime);
    }

    public startCheckTimer() {
        this.checkStartTime = new Date().getTime();
        this.timeRemaining = this.config.checkTime;
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
}
