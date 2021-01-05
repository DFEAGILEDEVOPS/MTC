import { Component, OnInit, EventEmitter, ElementRef, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { WarmupIntroRendered } from '../services/audit/auditEntry';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-warmup-intro',
  templateUrl: './warmup-intro.component.html',
  styles: []
})
export class WarmupIntroComponent implements AfterViewInit, OnDestroy {

  /**
   * Emit when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  protected window: any;

  private speechListenerEvent: any;

  public shouldShowMore: boolean;

  constructor(private auditService: AuditService,
              protected windowRefService: WindowRefService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
    this.window = windowRefService.nativeWindow;
    const config = questionService.getConfig();
    this.shouldShowMore = config && config.practice && (config.fontSize || config.colourContrast);
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new WarmupIntroRendered());

    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#start-now-button'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  onClick() {
    this.clickEvent.emit(null);
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
