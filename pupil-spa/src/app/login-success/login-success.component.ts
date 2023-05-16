import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Pupil } from '../pupil';
import { School } from '../school';
import { Config } from '../config.model';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { DeviceService } from '../services/device/device.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AppUsageService } from '../services/app-usage/app-usage.service';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit, AfterViewInit, OnDestroy {

  pupil: Pupil;
  school: School;
  config: Config;
  speechListenerEvent: any;

  constructor(private router: Router,
              private storageService: StorageService,
              private deviceService: DeviceService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private appUsageService: AppUsageService,
              private userService: UserService,
              private elRef: ElementRef) {
    const pupilData = storageService.getPupil();
    const schoolData = storageService.getSchool();

    // if the user comes back to this component after his personal data
    // was deleted (direct access through link or the back button in browser)
    // redirect him according to his status - logged in or not
    if (pupilData === null || schoolData === null) {
      if (this.userService.isLoggedIn()) {
        router.navigate(['check-start']);
      } else {
        router.navigate(['sign-in']);
      }
      return;
    }

    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.firstNameAlias = pupilData.firstNameAlias;
    this.pupil.lastName = pupilData.lastName;
    this.pupil.lastNameAlias = pupilData.lastNameAlias;
    this.pupil.dob = pupilData.dob;
    this.school = new School;
    this.school.name = schoolData.name;
    this.appUsageService.increment();

    // remove pupil data from local storage after setting them visually
    const checkCode = pupilData.checkCode;
    this.storageService.setPupil({ checkCode });

    this.config = this.questionService.getConfig();
  }

  get modeText(): string {
    return this.config.practice ? 'Try it Out' : 'Official'
  }

  async ngOnInit() {
    // Store various browser props in localStorage to be sent back to the server at the end of the check.
    await this.deviceService.capture();
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.config.questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#confirm-identity-button'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event: Event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  onClick() {
    const hasAccessSettings = this.config.audibleSounds ||
                              this.config.numpadRemoval ||
                              this.config.inputAssistance ||
                              this.config.questionReader ||
                              this.config.nextBetweenQuestions ||
                              this.config.fontSize ||
                              this.config.colourContrast;
    if (hasAccessSettings) {
      this.router.navigate(['access-settings']);
    } else {
      this.router.navigate(['check-start']);
    }
  }

  async ngOnDestroy(): Promise<void> {
    // remove pupil data from memory once component is destroyed
    this.pupil = undefined;
    // stop the current speech process if the page is changed
    if (this.config.questionReader) {
      await this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
