import { Component, OnInit } from '@angular/core';
import { APP_CONFIG } from '../services/config/config.service';
import { Login } from '../login/login.model';
import { LoginErrorService } from '../services/login-error/login-error.service';
import { LoginErrorDiagnosticsService } from '../services/login-error-diagnostics/login-error-diagnostics.service';
import { UserService } from '../services/user/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';

@Component({
  selector: 'app-login-pending',
  templateUrl: './login-pending.component.html',
  styleUrls: ['./login-pending.component.scss']
})
export class LoginPendingComponent implements OnInit {

  private submitted: boolean;
  public loginModel = new Login('', '');
  public loginSucceeded: boolean;
  public connectionFailed: boolean;
  private schoolPin: string;
  private pupilPin: string;
  loginPendingViewMinDisplay;

  constructor(
    private loginErrorService: LoginErrorService,
    private loginErrorDiagnosticsService: LoginErrorDiagnosticsService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private warmupQuestionService: WarmupQuestionService,
    private registerInputService: RegisterInputService,
    private pupilPrefsService: PupilPrefsService
  ) {
    const { loginPendingViewMinDisplay } = APP_CONFIG;
    this.loginPendingViewMinDisplay = loginPendingViewMinDisplay;
  }

  ngOnInit() {
    const startTime = Date.now();
    const queryParams = this.route.snapshot.queryParams;
    this.schoolPin = queryParams && queryParams.schoolPin;
    this.pupilPin = queryParams && queryParams.pupilPin;
    if (this.submitted === true) {
      return;
    }
    this.submitted = true;
    this.userService.login(this.schoolPin, this.pupilPin)
      .then(
        async () => {
          this.loginSucceeded = true;
          this.connectionFailed = false;
          this.questionService.initialise();
          this.warmupQuestionService.initialise();
          this.registerInputService.initialise();

          const config = this.questionService.getConfig();
          this.pupilPrefsService.loadPupilPrefs();
          await this.displayMinTime(startTime);
          if (config.fontSize) {
            this.router.navigate(['font-choice']);
          } else if (config.colourContrast) {
            this.router.navigate(['colour-choice']);
          } else {
            this.router.navigate(['sign-in-success']);
          }
        },
        async (err) => {
          await this.displayMinTime(startTime);
          this.submitted = false;
          this.loginErrorService.changeMessage(err.message);
          if (err.status === 401) {
            this.loginSucceeded = false;
            this.router.navigate(['sign-in'], { queryParams: { loginSucceeded: this.loginSucceeded } });
          } else {
            await this.loginErrorDiagnosticsService.process(err);
            this.router.navigate(['sign-in-fail']);
          }
        })
      .catch(async() => {
        await this.displayMinTime(startTime);
        this.loginSucceeded = false;
        this.submitted = false;
        this.router.navigate(['sign-in']);
      });
  }

  /**
   * Display login pending screen for minimum duration
   * @param {Number} startTime
   * @returns {Promise.<void>}
   */
  async displayMinTime(startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const minDisplay = this.loginPendingViewMinDisplay;
    if (duration < minDisplay) {
      const displayTime = minDisplay - duration;
      return this.sleep(displayTime);
    }
  }

  /**
   * Sleep function (milliseconds) to provide minimal display time for submission pending screen
   * @param {Number} ms
   * @returns {Promise.<void>}
   */
  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
