import { Component, HostListener, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Pupil } from '../pupil';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { AccessArrangementsConfig } from '../access-arrangements';
import { RouteService } from '../services/route/route.service';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { SpeechService } from '../services/speech/speech.service';
import { AppHidden, AppVisible } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';

@Component({
  selector: 'app-aa-fonts',
  templateUrl: './aa-fonts.component.html',
  styleUrls: ['./aa-fonts.component.scss']
})
export class AAFontsComponent implements AfterViewInit, OnDestroy {
  pupil: Pupil;
  validSelection = false;
  selectedSize;
  fontSettings;
  accessArrangements;
  speechListenerEvent: any;

  constructor(
    private routeService: RouteService,
    private questionService: QuestionService,
    private router: Router,
    private storageService: StorageService,
    private pupilPrefsService: PupilPrefsService,
    private elRef: ElementRef,
    private speechService: SpeechService,
    private auditService: AuditService
) {
    this.fontSettings = AccessArrangementsConfig.fontSettings;
    this.accessArrangements = this.storageService.getAccessArrangements();
    this.selectedSize = this.accessArrangements.fontSize || 'regular';
    this.checkValidSelection();

    this.pupil = storageService.getPupil() as Pupil;
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilityChange() {
    const visibilityState = document.visibilityState;
    if (visibilityState === 'hidden') {
      this.auditService.addEntry(new AppHidden());
    }
    if (visibilityState === 'visible') {
      this.auditService.addEntry(new AppVisible());
    }
  }

  selectionChange(selectedFont) {
    this.selectedSize = selectedFont;
    this.checkValidSelection();
  }

  onClick() {
    this.accessArrangements.fontSize = this.selectedSize;
    this.storageService.setAccessArrangements(this.accessArrangements);
    this.pupilPrefsService.storePupilPrefs();

    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      if (this.questionService.getConfig().colourContrast) {
        this.router.navigate(['colour-choice']);
      } else {
        this.router.navigate(['sign-in-success']);
      }
    }
  }

  @HostListener('window:resize')
  checkValidSelection() {
    const width = window.innerWidth;
    if (width < 641 && (this.selectedSize === 'large' || this.selectedSize === 'xlarge' || this.selectedSize === 'xxlarge')) {
      this.validSelection = false;
    } else if (width < 720 && (this.selectedSize === 'xlarge' || this.selectedSize === 'xxlarge')) {
      this.validSelection = false;
    } else {
      this.validSelection = true;
    }
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#next'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
