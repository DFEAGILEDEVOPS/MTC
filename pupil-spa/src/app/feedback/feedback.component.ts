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
    styleUrls: ['./feedback.component.scss'],
    standalone: false
})
export class FeedbackComponent implements OnInit, AfterViewInit, OnDestroy {

  public satisfactionRatings: object;
  public selectedSatisfactionRating: any;
  public errorExists: boolean;
  public errorSatisfactionRating: boolean;
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
    this.satisfactionRatings = [
      { id: 1, value: 'Very easy' },
      { id: 2, value: 'Easy' },
      { id: 3, value: 'Neither easy or difficult' },
      { id: 4, value: 'Difficult'},
      { id: 5, value: 'Very difficult'}
    ];
    this.errorExists = false;
    this.errorSatisfactionRating = false;
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

  async ngOnDestroy(): Promise<void> {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();
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
      case 'satisfactionRating':
        this.selectedSatisfactionRating = fieldValue;
        break;
    }

    if (this.selectedSatisfactionRating !== undefined) {
      this.enableSubmit = true;
    }
  }

   onSubmit() {
    if (this.submitted === true) {
      return;
    }

    this.errorSatisfactionRating = (this.selectedSatisfactionRating === undefined);

    if (this.errorSatisfactionRating === false) {
      this.feedbackData = {
        'satisfactionRating': this.selectedSatisfactionRating,
        'createdAt': new Date(),
        'checkCode': this.pupilData['checkCode' as keyof object]
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
