import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { FeedbackService } from '../services/feedback/feedback.service';
import { CheckStatusService } from '../services/check-status/check-status.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit, AfterViewInit, OnDestroy {

  public inputTypes: object;
  public satisfactionRatings: object;
  public selectedInputType: any;
  public selectedSatisfactionRating: any;
  public errorExists: boolean;
  public errorInputType: boolean;
  public errorSatisfactionRating: boolean;
  public errorCommentExists: boolean;
  public enableSubmit: boolean;
  public speechListenerEvent: any;

  private pupilData: object;
  private feedbackExists: boolean;
  private feedbackData: object;
  private submitted: boolean;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private checkStatusService: CheckStatusService,
    private speechService: SpeechService,
    private questionService: QuestionService,
    private elRef: ElementRef,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit() {
    if (!this.componentValidate()) {
      this.router.navigate(['feedback-thanks']);
    }
    const hasFinishedCheck = this.checkStatusService.hasFinishedCheck();
    if (!hasFinishedCheck) {
      this.router.navigate(['check-start']);
    }
    this.pupilData = this.storageService.getPupil();
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

  ngAfterViewInit() {
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement);

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event: any) => { this.speechService.focusEventListenerHook(event); },
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

  componentValidate() {
    const feedback = this.storageService.getFeedback()
    this.feedbackExists = (feedback === null)
    return this.feedbackExists
  }

  onSelectionChange(fieldType: string, fieldValue: any) {
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

   onSubmit(comments: string) {
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
        'checkCode': this.pupilData['checkCode' as keyof Object]
      };
      this.storageService.setFeedback(this.feedbackData);
      this.enableSubmit = false;
      this.submitted = true;

      // Saving in DB via API post
      this.feedbackService.postFeedback();

      this.router.navigate(['feedback-thanks']);
    }
  }
}
