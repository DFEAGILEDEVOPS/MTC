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
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { AuditService } from './services/audit/audit.service';
import { CheckCompleteComponent } from './check-complete/check-complete.component';
import { CheckComponent } from './check/check.component';
import { ContactComponent } from './contact/contact.component';
import { DeviceService } from './services/device/device.service';
import { FooterComponent } from './footer/footer.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { FeedbackService } from './services/feedback/feedback.service';
import { FeedbackThanksComponent } from './feedback-thanks/feedback-thanks.component';
import { HeaderComponent } from './header/header.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { LoadingComponent } from './loading/loading.component';
import { LoggedInGuard } from './routes/logged-in/logged-in.guard';
import { CanExitGuard } from './routes/can-exit/can-exit.guard';
import { LoginComponent } from './login/login.component';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { LogoutComponent } from './logout/logout.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { QuestionComponent } from './question/question.component';
import { QuestionService } from './services/question/question.service';
import { RegisterInputService} from './services/register-input/registerInput.service';
import { SoundComponent } from './sound/sound.component';
import { SpeechService } from './services/speech/speech.service';
import { StorageService } from './services/storage/storage.service';
import { UserService } from './services/user/user.service';
import { WarmupCompleteComponent } from './warmup-complete/warmup-complete.component';
import { WarmupIntroComponent } from './warmup-intro/warmup-intro.component';
import { WarmupLoadingComponent } from './warmup-loading/warmup-loading.component';
import { WarmupQuestionService } from './services/question/warmup-question.service';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { AppUsageService } from './services/app-usage/app-usage.service';
import { TokenService } from './services/token/token.service';
import { AzureQueueService } from './services/azure-queue/azure-queue.service';
import { CheckStartService } from './services/check-start/check-start.service';
import { CheckCompleteService} from './services/check-complete/check-complete.service';
import { RouteService } from './services/route/route.service';
import { LoginErrorService } from './services/login-error/login-error.service';
import { LoginErrorDiagnosticsService } from './services/login-error-diagnostics/login-error-diagnostics.service';
import { CheckStatusService } from './services/check-status/check-status.service';
import { ConnectivityService } from './services/connectivity-service/connectivity-service';
import { ConnectivityCheckGuard } from './connectivity-check.guard';

import { PracticeQuestionComponent } from './practice-question/practice-question.component';
import { SpokenPracticeQuestionComponent } from './spoken-practice-question/spoken-practice-question.component';
import { SpokenQuestionComponent } from './spoken-question/spoken-question.component';
import { SubmissionFailedComponent } from './submission-failed/submission-failed.component';
import { SubmissionPendingComponent } from './submission-pending/submission-pending.component';
import { QuestionsIntroComponent } from './questions-intro/questions-intro.component';
import { AAFontsComponent } from './aa-fonts/aa-fonts.component';
import { AASettingsComponent } from './aa-settings/aa-settings.component';
import { AAColoursComponent } from './aa-colours/aa-colours.component';
import { PageModificationsComponent } from './page-modifications/page-modifications.component';
import { QUEUE_STORAGE_TOKEN, IAzureStorage } from './services/azure-queue/azureStorage';
import { PupilPrefsService } from './services/pupil-prefs/pupil-prefs.service';
import { SvgCrownComponent } from './svg/svg.crown.component';
import { SvgWarningComponent } from './svg/svg.warning.component';
import { SvgLoadingComponent } from './svg/svg.loading.component';
import { SvgArrowComponent } from './svg/svg.arrow.component';
import { SvgGirlComponent } from './svg/svg.girl.component';
import { IdleModalComponent } from './modal/idle.modal.component';
import { TimerService } from './services/timer/timer.service';
import { OutOfTimeComponent } from './out-of-time/out-of-time.component';
import { SvgClockComponent } from './svg/svg.clock.component';
import { SessionExpiredComponent } from './session-expired/session-expired.component';
import { WebsiteOfflineComponent } from './website-offline/website-offline.component';
import { LoginFailureComponent } from './login-failure/login-failure.component';
import { ConnectivityCheckComponent } from './connectivity-check/connectivity-check.component';
import { ConnectivityErrorComponent } from './connectivity-error/connectivity-error.component';

declare var AzureStorage: IAzureStorage;

const appRoutes: Routes = [
  {path: '', redirectTo: 'connectivity-check', pathMatch: 'full'},
  {path: 'check', component: CheckComponent, canActivate: [LoggedInGuard], canDeactivate: [CanExitGuard]},
  {path: 'check-start', component: InstructionsComponent, canActivate: [LoggedInGuard]},
  {path: 'feedback', component: FeedbackComponent},
  {path: 'feedback-thanks', component: FeedbackThanksComponent},
  {path: 'connectivity-check', component: ConnectivityCheckComponent, canActivate: [ConnectivityCheckGuard]},
  {path: 'connectivity-error', component: ConnectivityErrorComponent},
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-in-fail', component: LoginFailureComponent},
  {path: 'sign-out', component: LogoutComponent, canActivate: [LoggedInGuard]},
  {path: 'check-complete', component: CheckCompleteComponent },
  {path: 'submission-failed', component: SubmissionFailedComponent },
  {path: 'session-expired', component: SessionExpiredComponent },
  {path: 'font-choice', component: AAFontsComponent },
  {path: 'colour-choice', component: AAColoursComponent },
  {path: 'access-settings', component: AASettingsComponent },
  {path: 'out-of-time', component: OutOfTimeComponent },
  {path: 'contact', component: ContactComponent },
  {path: 'accessibility-statement', component: AccessibilityStatementComponent },
  {path: 'privacy', component: PrivacyComponent },
  {path: 'service-unavailable', component: WebsiteOfflineComponent }
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
    AuditService,
    DeviceService,
    FeedbackService,
    LoggedInGuard,
    QuestionService,
    RegisterInputService,
    SpeechService,
    StorageService,
    UserService,
    WarmupQuestionService,
    WindowRefService,
    CheckStatusService,
    AppUsageService,
    CheckStartService,
    CheckCompleteService,
    PupilPrefsService,
    TokenService,
    AzureQueueService,
    RouteService,
    TimerService,
    LoginErrorService,
    LoginErrorDiagnosticsService,
    ConnectivityService,
    ConnectivityCheckGuard,
    CanExitGuard,
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
