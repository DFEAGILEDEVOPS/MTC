import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Pupil } from '../pupil';
import { School } from '../school';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { DeviceService } from '../services/device/device.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AppUsageService } from '../services/app-usage/app-usage.service';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit, AfterViewInit, OnDestroy {

  pupil: Pupil;
  school: School;

  constructor(private router: Router,
              private storageService: StorageService,
              private deviceService: DeviceService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private appUsageService: AppUsageService,
              private elRef: ElementRef) {
    const pupilData = storageService.getItem('pupil');
    const schoolData = storageService.getItem('school');
    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
    this.pupil.dob = pupilData.dob;
    this.school = new School;
    this.school.name = schoolData.name;
    this.appUsageService.increment();
  }

  async ngOnInit() {
    // Store various browser props in localStorage to be sent back to the server at the end of the check.
    await this.deviceService.capture();
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);
    }
  }

  onClick() {
    this.router.navigate(['check-start']);
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.cancel();
    }
  }
}
