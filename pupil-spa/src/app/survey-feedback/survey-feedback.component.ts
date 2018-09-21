import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FeedbackService } from '../services/feedback/feedback.service';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-survey-feedback',
  templateUrl: './survey-feedback.component.html',
  styleUrls: ['./survey-feedback.component.scss']
})
export class SurveyFeedbackComponent {
  public feedbackForm: FormGroup;
  public userSubmittedForm = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private feedbackService: FeedbackService,
    private storageService: StorageService) {

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

  async onSubmit() {
    if (this.isFormInvalid()) {
      this.userSubmittedForm = true;
      // scroll to the top so users can see validation errors
      scroll(0, 0);
      return ;
    }

    try {
      await this.feedbackService.postSurveyFeedback(this.feedbackForm.value);
    } catch (e) {}

    this.storageService.setItem('feedback_given', true);
    this.router.navigate(['ict-survey/feedback-thanks']);
  }

  isFormInvalid(): boolean {
    return !this.feedbackForm.valid;
  }
}
