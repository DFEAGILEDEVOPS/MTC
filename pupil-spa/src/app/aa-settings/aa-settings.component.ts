import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { Config } from '../config.model';
import { SpeechService } from '../services/speech/speech.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-aa-settings',
  templateUrl: './aa-settings.component.html',
  styleUrls: ['./aa-settings.component.scss']
})
export class AASettingsComponent implements AfterViewInit, OnDestroy {

  public config: Config;
  public speechListenerEvent: any;
  public formSubmitted = false;
  public validationPattern = '^[a-zA-Z0-9À-ÖØ-öø-ÿ’\'-]*$';

  @ViewChild('inputAssistantForm') public inputAssistantForm: NgForm;

  constructor(
    private router: Router,
    private elRef: ElementRef,
    private questionService: QuestionService,
    private storageService: StorageService,
    private speechService: SpeechService
  ) {
    this.config = questionService.getConfig();
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

  onClick() {
    if (this.config.inputAssistance && !this.config.practice) {
      this.formSubmitted = true;
      if (!this.inputAssistantForm.valid) {
        return;
      } else {
        const pupilData = this.storageService.getItem('pupil');
        pupilData.inputAssistant = {
          firstName: this.inputAssistantForm.value.inputAssistantFirstName,
          lastName: this.inputAssistantForm.value.inputAssistantLastName,
        };
        this.storageService.setItem('pupil', pupilData);
      }
    }
    this.router.navigate(['check-start']);
  }
}
