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
  private feedbackForm: FormGroup;
  private userSubmittedForm: boolean = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder) {

    this.feedbackForm = this.formBuilder.group({
      comment: ['', [Validators.required, Validators.maxLength(1200)]],
      firstName: [''],
      lastName: [''],
      contactNumber: [''],
      emailAddress: [''],
      schoolName: ['']
    });

  }

  get comment() { return this.feedbackForm.get('comment'); }

  onSubmit() {
    if (!this.feedbackForm.valid) {
      this.userSubmittedForm = true;
      scroll(0,0);      
      return
    }
    this.router.navigate(['ict-survey/feedback-thanks']);
  }

}
