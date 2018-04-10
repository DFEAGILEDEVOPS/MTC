import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-check-complete',
  templateUrl: './check-complete.component.html',
  styleUrls: ['./check-complete.component.css']
})
export class CheckCompleteComponent implements OnInit {

  protected window: any;

  constructor(private storageService: StorageService,
              protected windowRefService: WindowRefService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.storageService.setItem('pending_submission', false);
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/check-complete'
    });
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    this.speechService.cancel();
  }
}
