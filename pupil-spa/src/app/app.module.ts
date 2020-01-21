import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { GlobalErrorHandler } from './error-handler';
import { AppConfigService, loadConfigService } from './services/config/config.service';

import { AccessibilityStatementComponent } from './accessibility-statement/accessibility-statement.component';
import { AnswerService } from './services/answer/answer.service';
import { AppComponent } from './app.component';
import { AppUsageService } from './services/app-usage/app-usage.service';
import { AuditService } from './services/audit/audit.service';
import { AzureQueueService } from './services/azure-queue/azure-queue.service';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { CheckCompleteComponent } from './check-complete/check-complete.component';
import { CheckCompleteService} from './services/check-complete/check-complete.service';
import { CheckComponent } from './check/check.component';
import { CheckStartService } from './services/check-start/check-start.service';
import { CheckStatusService } from './services/check-status/check-status.service';
import { ConnectivityCheckGuard } from './connectivity-check.guard';
import { ConnectivityService } from './services/connectivity-service/connectivity-service';
import { ContactComponent } from './contact/contact.component';
import { DeviceService } from './services/device/device.service';
import { FeedbackComponent } from './feedback/feedback.component';
import { FeedbackService } from './services/feedback/feedback.service';
import { FeedbackThanksComponent } from './feedback-thanks/feedback-thanks.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { LoadingComponent } from './loading/loading.component';
import { LoggedInGuard } from './routes/logged-in/logged-in.guard';
import { CanExitGuard } from './routes/can-exit/can-exit.guard';
import { LoginComponent } from './login/login.component';
import { LoginErrorDiagnosticsService } from './services/login-error-diagnostics/login-error-diagnostics.service';
import { LoginErrorService } from './services/login-error/login-error.service';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { LogoutComponent } from './logout/logout.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { QuestionComponent } from './question/question.component';
import { QuestionService } from './services/question/question.service';
import { RegisterInputService} from './services/register-input/registerInput.service';
import { RouteService } from './services/route/route.service';
import { SoundComponent } from './sound/sound.component';
import { SpeechService } from './services/speech/speech.service';
import { StorageService } from './services/storage/storage.service';
import { TokenService } from './services/token/token.service';
import { UserService } from './services/user/user.service';
import { WarmupCompleteComponent } from './warmup-complete/warmup-complete.component';
import { WarmupIntroComponent } from './warmup-intro/warmup-intro.component';
import { WarmupLoadingComponent } from './warmup-loading/warmup-loading.component';
import { WarmupQuestionService } from './services/question/warmup-question.service';
import { WindowRefService } from './services/window-ref/window-ref.service';

import { AAColoursComponent } from './aa-colours/aa-colours.component';
import { AAFontsComponent } from './aa-fonts/aa-fonts.component';
import { AASettingsComponent } from './aa-settings/aa-settings.component';
import { ConnectivityCheckComponent } from './connectivity-check/connectivity-check.component';
import { ConnectivityErrorComponent } from './connectivity-error/connectivity-error.component';
import { IdleModalComponent } from './modal/idle.modal.component';
import { LoginFailureComponent } from './login-failure/login-failure.component';
import { OutOfTimeComponent } from './out-of-time/out-of-time.component';
import { PageModificationsComponent } from './page-modifications/page-modifications.component';
import { PracticeQuestionComponent } from './practice-question/practice-question.component';
import { PupilPrefsService } from './services/pupil-prefs/pupil-prefs.service';
import { QuestionsIntroComponent } from './questions-intro/questions-intro.component';
import { QUEUE_STORAGE_TOKEN, IAzureStorage } from './services/azure-queue/azureStorage';
import { SessionExpiredComponent } from './session-expired/session-expired.component';
import { SpokenPracticeQuestionComponent } from './spoken-practice-question/spoken-practice-question.component';
import { SpokenQuestionComponent } from './spoken-question/spoken-question.component';
import { SubmissionFailedComponent } from './submission-failed/submission-failed.component';
import { SubmissionPendingComponent } from './submission-pending/submission-pending.component';
import { SvgArrowComponent } from './svg/svg.arrow.component';
import { SvgClockComponent } from './svg/svg.clock.component';
import { SvgCrownComponent } from './svg/svg.crown.component';
import { SvgGirlComponent } from './svg/svg.girl.component';
import { SvgLoadingComponent } from './svg/svg.loading.component';
import { SvgWarningComponent } from './svg/svg.warning.component';
import { TimerService } from './services/timer/timer.service';
import { WebsiteOfflineComponent } from './website-offline/website-offline.component';

declare var AzureStorage: IAzureStorage;

const appRoutes: Routes = [
  {path: '', redirectTo: 'connectivity-check', pathMatch: 'full'},
  {path: 'access-settings', component: AASettingsComponent },
  {path: 'accessibility-statement', component: AccessibilityStatementComponent },
  {path: 'check', component: CheckComponent, canActivate: [LoggedInGuard], canDeactivate: [CanExitGuard]},
  {path: 'check-complete', component: CheckCompleteComponent },
  {path: 'check-start', component: InstructionsComponent, canActivate: [LoggedInGuard]},
  {path: 'colour-choice', component: AAColoursComponent },
  {path: 'connectivity-check', component: ConnectivityCheckComponent, canActivate: [ConnectivityCheckGuard]},
  {path: 'connectivity-error', component: ConnectivityErrorComponent},
  {path: 'contact', component: ContactComponent },
  {path: 'feedback', component: FeedbackComponent},
  {path: 'feedback-thanks', component: FeedbackThanksComponent},
  {path: 'font-choice', component: AAFontsComponent },
  {path: 'out-of-time', component: OutOfTimeComponent },
  {path: 'privacy', component: PrivacyComponent },
  {path: 'service-unavailable', component: WebsiteOfflineComponent },
  {path: 'session-expired', component: SessionExpiredComponent },
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-fail', component: LoginFailureComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-out', component: LogoutComponent, canActivate: [LoggedInGuard]},
  {path: 'submission-failed', component: SubmissionFailedComponent }
  // { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AAColoursComponent,
    AAFontsComponent,
    AASettingsComponent,
    AccessibilityStatementComponent,
    AppComponent,
    BreadcrumbsComponent,
    CheckCompleteComponent,
    CheckComponent,
    ConnectivityCheckComponent,
    ConnectivityErrorComponent,
    ContactComponent,
    FeedbackComponent,
    FeedbackThanksComponent,
    FooterComponent,
    HeaderComponent,
    IdleModalComponent,
    InstructionsComponent,
    LoadingComponent,
    LoginComponent,
    LoginFailureComponent,
    LoginSuccessComponent,
    LogoutComponent,
    OutOfTimeComponent,
    PageModificationsComponent,
    PracticeQuestionComponent,
    PrivacyComponent,
    QuestionComponent,
    QuestionsIntroComponent,
    SessionExpiredComponent,
    SoundComponent,
    SpokenPracticeQuestionComponent,
    SpokenQuestionComponent,
    SubmissionFailedComponent,
    SubmissionPendingComponent,
    SvgArrowComponent,
    SvgClockComponent,
    SvgCrownComponent,
    SvgGirlComponent,
    SvgLoadingComponent,
    SvgWarningComponent,
    WarmupCompleteComponent,
    WarmupIntroComponent,
    WarmupLoadingComponent,
    WebsiteOfflineComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: false} // <-- debugging purposes only
    ),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    Angulartics2Module.forRoot({
      pageTracking: {
        excludedRoutes: [
          'check',
        ]
      }
    })
  ],
  providers: [
    AppConfigService,
    { provide: APP_INITIALIZER, useFactory: loadConfigService , deps: [AppConfigService], multi: true },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    AnswerService,
    AppUsageService,
    AuditService,
    AzureQueueService,
    CanExitGuard,
    CheckCompleteService,
    CheckStartService,
    CheckStatusService,
    ConnectivityCheckGuard,
    ConnectivityService,
    DeviceService,
    FeedbackService,
    LoggedInGuard,
    LoginErrorDiagnosticsService,
    LoginErrorService,
    PupilPrefsService,
    QuestionService,
    RegisterInputService,
    RouteService,
    SpeechService,
    StorageService,
    TimerService,
    TokenService,
    UserService,
    WarmupQuestionService,
    WindowRefService,
    {
      provide: QUEUE_STORAGE_TOKEN,
      useValue: AzureStorage.Queue
    }
  ],
  entryComponents: [
    IdleModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
