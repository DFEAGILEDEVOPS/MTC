import { Component, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import { APP_CONFIG } from '../services/config/config.service'
import { Router } from '@angular/router'

import { LoginErrorService } from '../services/login-error/login-error.service'
import { LoginErrorDiagnosticsService } from '../services/login-error-diagnostics/login-error-diagnostics.service'
import { UserService } from '../services/user/user.service'
import { QuestionService } from '../services/question/question.service'
import { WarmupQuestionService } from '../services/question/warmup-question.service'
import { CheckStatusService } from '../services/check-status/check-status.service'
import { Login } from './login.model'
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service'
import { DeviceService } from '../services/device/device.service'
import { QrCodeUsageService } from '../services/qr-code-usage/qr-code-usage.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  private submitted: boolean
  public loginModel = new Login('', '', '')
  public loginPending: boolean
  public loginSucceeded: boolean
  public connectionFailed: boolean
  public loginPendingViewMinDisplay: number
  //@ts-ignore used in ngOnInit
  private errorMessage: string
  public isUnsupportedBrowser: boolean
  public isLocalStorageEnabled: boolean

  constructor (
    private deviceService: DeviceService,
    private loginErrorService: LoginErrorService,
    private loginErrorDiagnosticsService: LoginErrorDiagnosticsService,
    private userService: UserService,
    private router: Router,
    private questionService: QuestionService,
    private warmupQuestionService: WarmupQuestionService,
    private elRef: ElementRef,
    private checkStatusService: CheckStatusService,
    private pupilPrefsService: PupilPrefsService,
    private qrCodeUsageService: QrCodeUsageService,
  ) {
    const { loginPendingViewMinDisplay } = APP_CONFIG
    this.loginPendingViewMinDisplay = loginPendingViewMinDisplay
  }

  ngOnInit () {
    this.isUnsupportedBrowser = this.deviceService.isUnsupportedBrowser()
    this.loginPending = false
    const hasUnfinishedCheck = this.checkStatusService.hasUnfinishedCheck()
    if (hasUnfinishedCheck) {
      this.router.navigate(['check'], { queryParams: { unfinishedCheck: true } })
    }
    this.isLocalStorageEnabled = this.deviceService.isLocalStorageEnabled()
    if (this.isLocalStorageEnabled === false) {
      this.router.navigate(['local-storage-error'])
    }
    this.loginErrorService.currentErrorMessage.subscribe(message => this.errorMessage = message)
  }

  ngAfterViewInit () {
    // disable pin change when input is scrolled
    const input = this.elRef.nativeElement.querySelector('#pupilPin')
    input.addEventListener('mousewheel', function (e: Event) {
      e.preventDefault()
    })
    // firefox uses DOMMouseScroll instead of mousewheel
    input.addEventListener('DOMMouseScroll', function (e: Event) {
      e.preventDefault()
    })
    // prevent arrow up or down to change the input value
    input.addEventListener('keydown', function (e: any) {
      if (e.which === 38 || e.which === 40) {
        e.preventDefault()
      }
    })
  }

  /**
   * Handler for the login form submit action
   */
  onSubmit (schoolPin: string, pupilPin: string) {
    const startTime = Date.now()
    this.loginPending = true
    if (this.submitted === true) {
      return
    }
    this.submitted = true
    this.userService.login(schoolPin, pupilPin)
      .then(
        async () => {
          this.loginSucceeded = true
          this.connectionFailed = false
          this.questionService.initialise()
          this.warmupQuestionService.initialise()
          this.pupilPrefsService.loadPupilPrefs()
          const config = this.questionService.getConfig()
          if (config.practice === false) {
            // only set the cookie for live checks
            this.deviceService.setupDeviceCookie()
          }
          this.qrCodeUsageService.storeToLocalStorage()
          await this.displayMinTime(startTime)
          this.loginPending = false
          if (config.fontSize) {
            this.router.navigate(['font-choice'])
          } else if (config.colourContrast) {
            this.router.navigate(['colour-choice'])
          } else {
            this.router.navigate(['sign-in-success'])
          }
        },
        async (err) => {
          this.submitted = false
          this.loginErrorService.changeMessage(err.message)
          if (err.status === 401) {
            await this.displayMinTime(startTime)
            this.loginPending = false
            this.loginSucceeded = false
            this.router.navigate(['sign-in'])
          } else {
            await this.loginErrorDiagnosticsService.process(err)
            this.router.navigate(['sign-in-fail'])
          }
        })
      .catch(async () => {
        await this.displayMinTime(startTime)
        this.loginPending = false
        this.loginSucceeded = false
        this.submitted = false
        this.router.navigate(['sign-in'])
      })
  }

  /**
   * Display login pending screen for minimum duration
   * @param {Number} startTime
   * @returns {Promise.<void>}
   */
  async displayMinTime (startTime: number) {
    const endTime = Date.now()
    const duration = endTime - startTime
    const minDisplay = this.loginPendingViewMinDisplay
    if (duration < minDisplay) {
      const displayTime = minDisplay - duration
      return this.sleep(displayTime)
    }
  }

  /**
   * Sleep function (milliseconds) to provide minimal display time for submission pending screen
   * @param {Number} ms
   * @returns {Promise.<void>}
   */
  private sleep (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
