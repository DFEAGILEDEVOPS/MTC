import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  AccessArrangementsConfig,
} from '../access-arrangements';
import { StorageService } from '../services/storage/storage.service';
import { RouteService } from '../services/route/route.service';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-aa-colours',
  templateUrl: './aa-colours.component.html',
  styleUrls: ['./aa-colours.component.scss']
})
export class AAColoursComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedContrast: string;
  contrastSettings: object[];
  accessArrangements: any;
  backLinkUrl: string;
  speechListenerEvent: any;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private routeService: RouteService,
    private pupilPrefsService: PupilPrefsService,
    private questionService: QuestionService,
    private elRef: ElementRef,
    private speechService: SpeechService
  ) {
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
    this.accessArrangements = this.storageService.getAccessArrangements();
    this.selectedContrast = this.accessArrangements.contrast || 'bow';
  }

  ngOnInit() {
    const validBackLinks = ['/access-settings', '/font-choice'];
    if (validBackLinks.indexOf(this.routeService.getPreviousUrl()) !== -1) {
      this.backLinkUrl = this.routeService.getPreviousUrl();
    }
  }


  selectionChange(selectedContrast: string) {
    this.selectedContrast = selectedContrast;
  }

  onClick() {
    this.accessArrangements.contrast = this.selectedContrast;
    this.storageService.setAccessArrangements(this.accessArrangements);
    this.pupilPrefsService.storePupilPrefs();

    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      this.router.navigate(['sign-in-success']);
    }
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#next'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event: any) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  async ngOnDestroy(): Promise<void> {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
