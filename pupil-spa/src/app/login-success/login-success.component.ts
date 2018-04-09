import { Component, ElementRef, OnInit } from '@angular/core';
import { Pupil } from '../pupil';
import { School } from '../school';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { DeviceService } from '../services/device/device.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit {

  pupil: Pupil;
  school: School;

  constructor(private router: Router,
              private storageService: StorageService,
              private deviceService: DeviceService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
    const pupilData = storageService.getItem('pupil');
    const schoolData = storageService.getItem('school');
    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
    this.pupil.dob = pupilData.dob;
    this.school = new School;
    this.school.name = schoolData.name;
  }

  async ngOnInit() {
    // Store various browser props in localStorage to be sent back to the server at the end of the check.
    await this.deviceService.capture();
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().speechSynthesis) {
      let speechText = '';

      // get all elements containing text from the current component
      let elements = this.elRef.nativeElement.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, button'
      );

      // add 'artificial' pauses to take visual newlines or spaces into account
      elements.forEach(elem => speechText += elem.textContent + ' , ');

      this.speechService.speak(speechText);
    }
  }

  onClick() {
    this.router.navigate(['check-start']);
  }
}
