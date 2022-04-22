import { Component, OnInit, AfterViewInit, NgZone, OnDestroy, Input, Renderer2 } from '@angular/core';
import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { QuestionComponent } from '../question/question.component';
import { QuestionRendered, QuestionTimerCancelled } from '../services/audit/auditEntry';
import { QuestionService } from '../services/question/question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { Answer } from '../services/answer/answer.model';

@Component( {
  selector: 'app-spoken-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
} )
export class SpokenQuestionComponent extends QuestionComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription: Subscription;

  /**
   * Do not show 'practice' label on top left.
   */
  public isWarmUpQuestion = false;

  constructor( protected auditService: AuditService,
    protected windowRefService: WindowRefService,
    protected registerInputService: RegisterInputService,
    protected zone: NgZone,
    protected storageService: StorageService,
    protected speechService: SpeechService,
    protected questionService: QuestionService,
    protected answerService: AnswerService,
    protected renderer: Renderer2 ) {
    super( auditService, windowRefService, questionService, storageService, speechService, answerService, registerInputService, renderer );
  }

  ngOnInit () {
    this.remainingTime = this.questionTimeoutSecs;
    this.shouldShowQuestion = false;

    this.subscription = this.speechService.speechStatus.subscribe( speechStatus => {
      this.zone.run( () => {
        if ( !this.timeout && speechStatus === SpeechService.questionSpeechEnded ) {
          // console.log('SpokenQuestionComponent: Starting the timer');
          this.startTimer();
          this.shouldShowQuestion = true;
        }
      } );
    } );
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit () {
    this.auditService.addEntry( new QuestionRendered( {
      sequenceNumber: this.sequenceNumber,
      question: `${ this.factor1 }x${ this.factor2 }`,
      isWarmup: this.isWarmUpQuestion
    } ) );

    // Set up listening events depending on the browser's capability
    if ( this.shouldSetupPointerEvents() ) {
      this.setupKeypadEventListeners( 'pointerup' );
    } else {
      this.setupKeypadEventListeners( 'click' );
    }

    this.speechService.speakQuestion( `${ this.factor1 } times ${ this.factor2 }?`, this.sequenceNumber );
  }

  ngOnDestroy () {
    this.subscription.unsubscribe();

    // remove all the event listeners
    if ( this.cleanUpFunctions.length > 0 ) {
      this.cleanUpFunctions.forEach( f => f() );
    }
  }

  /**
   * Called from pressing Enter on the virtual Keypad or pressing the enter key on the keyboard
   * @override
   * @return {boolean}
   */
  onSubmit () {
    if ( this.submitted ) {
      return false;
    }
    if ( !this.hasAnswer() ) {
      return false;
    }

    // Prevent the default timeout from firing later
    if ( this.timeout ) {
      clearTimeout( this.timeout );
      this.timeout = undefined;
    } else {
      return false;
    }

    // Store the answer
    const answer = new Answer( this.factor1, this.factor2, this.answer, this.sequenceNumber );
    this.answerService.setAnswer( answer );

    // Clear the interval timer and add a QuestionTimerCancelled event.question.
    if ( this.countdownInterval ) {
      this.auditService.addEntry( new QuestionTimerCancelled( {
        sequenceNumber: this.sequenceNumber,
        question: `${ this.factor1 }x${ this.factor2 }`,
        isWarmup: this.isWarmUpQuestion
      } ) );
      clearInterval( this.countdownInterval );
      this.countdownInterval = undefined;
    }

    this.addQuestionAnsweredEvent();
    this.submitted = true;
    if ( this.config.questionReader ) {
      this.speechService.waitForEndOfSpeech().then( () => {
        this.manualSubmitEvent.emit( this.answer );
      } );
    } else {
      this.manualSubmitEvent.emit( this.answer );
    }
    return true;
  }
}
