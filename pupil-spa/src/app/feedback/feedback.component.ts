import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { FeedbackService } from '../services/feedback/feedback.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  public inputTypes: object;
  public satisfactionRatings: object;
  public selectedInputType;
  public selectedSatisfactionRating;
  public errorExists: boolean;
  public errorInputType: boolean;
  public errorSatisfactionRating: boolean;
  public errorCommentExists: boolean;
  public enableSubmit: boolean;

  private pupilData: object;
  private feedbackExists: boolean;
  private feedbackData: object;
  private submitted: boolean;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit() {
    if (!this.componentValidate()) {
      this.router.navigate(['feedback-thanks']);
    }
    const questions = this.storageService.getItem('questions');
    const answers = this.storageService.getItem('answers');
    if (!answers || !questions || questions.length !== answers.length) {
      this.router.navigate(['check-start']);
    }
    this.pupilData = this.storageService.getItem('pupil');
    this.inputTypes = [
      { id: 1, value: 'Touchscreen' },
      { id: 2, value: 'Mouse' },
      { id: 3, value: 'Keyboard' },
      { id: 4, value: 'Mix of the above'}
    ];
    this.satisfactionRatings = [
      { id: 1, value: 'Very easy' },
      { id: 2, value: 'Easy' },
      { id: 3, value: 'Neither easy or difficult' },
      { id: 4, value: 'Difficult'},
      { id: 5, value: 'Very difficult'}
    ];
    this.errorExists = false;
    this.errorInputType = false;
    this.errorSatisfactionRating = false;
    this.errorCommentExists = false;
    this.submitted = false;
    this.enableSubmit = false;
  }

  componentValidate() {
    this.feedbackExists = this.storageService.getItem('feedback');
    return (this.feedbackExists === null);
  }

  onSelectionChange(fieldType, fieldValue) {
    switch (fieldType) {
      case 'inputType':
        this.selectedInputType = fieldValue;
        break;
      case 'satisfactionRating':
        this.selectedSatisfactionRating = fieldValue;
        break;
    }

    if (this.selectedInputType !== undefined && this.selectedSatisfactionRating !== undefined) {
      this.enableSubmit = true;
    }
  }

  async onSubmit(comments) {
    if (this.submitted === true) {
      return;
    }

    this.errorInputType = (this.selectedInputType === undefined);
    this.errorSatisfactionRating = (this.selectedSatisfactionRating === undefined);

    if (this.errorInputType === false && this.errorSatisfactionRating === false) {
      this.feedbackData = {
        'inputType': this.selectedInputType,
        'satisfactionRating': this.selectedSatisfactionRating,
        'comments': comments,
        'createdAt': new Date(),
        'sessionId': this.pupilData['sessionId']
      };
      this.storageService.setItem('feedback', this.feedbackData);
      this.enableSubmit = false;
      this.submitted = true;

      // Saving in DB via API post
      await this.feedbackService.postFeedback();

      this.router.navigate(['feedback-thanks']);
    }
  }
}
