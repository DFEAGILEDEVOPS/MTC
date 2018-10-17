import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Config } from '../config.model';
import { SpeechService } from '../services/speech/speech.service';

@Component({
  selector: 'app-familiarisation-settings',
  templateUrl: './familiarisation-settings.component.html',
  styleUrls: ['./familiarisation-settings.component.scss']
})
export class FamiliarisationSettingsComponent implements AfterViewInit, OnDestroy {
  public familiarisationSettingsForm: FormGroup;
  public userSubmittedForm = false;
  private validationPattern = '^[a-zA-Z0-9À-ÖØ-öø-ÿ’\'-]*$';

  private config: Config;
  private speechListenerEvent: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private elRef: ElementRef,
    private questionService: QuestionService,
    private storageService: StorageService,
    private speechService: SpeechService
  ) {
    this.config = questionService.getConfig();
    this.familiarisationSettingsForm = this.formBuilder.group({
      inputAssistantFirstName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(128),
        Validators.pattern(this.validationPattern)
      ])),
      inputAssistantLastName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(128),
        Validators.pattern(this.validationPattern)
      ])),
    });
  }

  get inputAssistantFirstName() { return this.familiarisationSettingsForm.get('inputAssistantFirstName'); }
  get inputAssistantLastName() { return this.familiarisationSettingsForm.get('inputAssistantLastName'); }


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
    this.router.navigate(['check-start']);
  }

  onSubmit(inputAssistantFirstName, inputAssistantLastName) {
    if (!this.familiarisationSettingsForm.valid) {
      this.userSubmittedForm = true;
      return;
    }
    const pupilData = this.storageService.getItem('pupil');
    pupilData.inputAssistant = {
      firstName: inputAssistantFirstName,
      lastName: inputAssistantLastName,
    };
    this.storageService.setItem('pupil', pupilData);
    this.router.navigate(['check-start']);
  }
}
