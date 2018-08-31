import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-survey-feedback',
  templateUrl: './survey-feedback.component.html',
  styleUrls: ['./survey-feedback.component.scss']
})
export class SurveyFeedbackComponent {
  feedbackForm;
  
  constructor(
    private router: Router,
    private formBuilder: FormBuilder) {

    this.feedbackForm = this.formBuilder.group({
      comment: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      contactNumber: ['', Validators.required],
      emailAddress: ['', Validators.required],
      schoolName: ['']
    });

  }

  onSubmit() {
    console.log(this.feedbackForm.value);
    this.router.navigate(['ict-survey/feedback-thanks']);
  }

}
