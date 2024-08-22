// Angular modules
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalErrorHandler } from './error-handler';
import { AppConfigService, loadConfigService } from './services/config/config.service';
import { CookieService } from 'ngx-cookie-service';
// Services
import { AccessibilityStatementComponent } from './accessibility-statement/accessibility-statement.component';
import { AnswerService } from './services/answer/answer.service';
import { AppComponent } from './app.component';
import { AppUsageService } from './services/app-usage/app-usage.service';
import { AuditService } from './services/audit/audit.service';
import { AuditEntryFactory } from './services/audit/auditEntry'
import { AzureQueueService } from './services/azure-queue/azure-queue.service';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { CheckCompleteComponent } from './check-complete/check-complete.component';
import { CheckCompleteService} from './services/check-complete/check-complete.service';
import { CheckComponent } from './check/check.component';
import { CheckStartService } from './services/check-start/check-start.service';
import { CheckStatusService } from './services/check-status/check-status.service';
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
import { QuestionComponent } from './question/question.component';
import { QuestionService } from './services/question/question.service';
import { RegisterInputService} from './services/register-input/registerInput.service';
import { RouteService } from './services/route/route.service';
import { SoundComponent } from './sound/sound.component';
import { SpeechService } from './services/speech/speech.service';
import { StorageService } from './services/storage/storage.service';
import { SubmissionService } from './services/submission/submission.service';
import { TokenService } from './services/token/token.service';
import { UserService } from './services/user/user.service';
import { WarmupCompleteComponent } from './warmup-complete/warmup-complete.component';
import { WarmupIntroComponent } from './warmup-intro/warmup-intro.component';
import { WarmupLoadingComponent } from './warmup-loading/warmup-loading.component';
import { WarmupQuestionService } from './services/question/warmup-question.service';
import { WindowRefService } from './services/window-ref/window-ref.service';
// Components
import { AAColoursComponent } from './aa-colours/aa-colours.component';
import { AAFontsComponent } from './aa-fonts/aa-fonts.component';
import { AASettingsComponent } from './aa-settings/aa-settings.component';
import { IdleModalComponent } from './modal/idle.modal.component';
import { LoginFailureComponent } from './login-failure/login-failure.component';
import { OutOfTimeComponent } from './out-of-time/out-of-time.component';
import { PageVisibilityComponent } from './page-visibility/page-visibility.component';
import { PageModificationsComponent } from './page-modifications/page-modifications.component';
import { PracticeQuestionComponent } from './practice-question/practice-question.component';
import { PupilPrefsService } from './services/pupil-prefs/pupil-prefs.service';
import { QuestionsIntroComponent } from './questions-intro/questions-intro.component';
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
import { ApplicationInsightsService } from './services/app-insights/app-insights.service';
import { TestErrorComponent } from './test-error/test-error.component';
import { HttpService } from './services/http/http.service';
import { ErrorLocalStorageComponent } from './error-localstorage/error-local-storage.component';
import { QrCodeArrivalComponent } from './qr-code-arrival/qr-code-arrival.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component'

const appRoutes: Routes = [
  // GUY - remove? is this a root default? what replaces it? {path: '', redirectTo: 'connectivity-check', pathMatch: 'full'},
  {path: 'access-settings', component: AASettingsComponent },
  {path: 'accessibility-statement', component: AccessibilityStatementComponent },
  {path: 'check', component: CheckComponent, canActivate: [LoggedInGuard], canDeactivate: [CanExitGuard]},
  {path: 'check-complete', component: CheckCompleteComponent, canActivate: [LoggedInGuard] },
  {path: 'check-start', component: InstructionsComponent, canActivate: [LoggedInGuard]},
  {path: 'colour-choice', component: AAColoursComponent },
  {path: 'contact', component: ContactComponent },
  {path: 'feedback', component: FeedbackComponent, canActivate: [LoggedInGuard]},
  {path: 'feedback-thanks', component: FeedbackThanksComponent, canActivate: [LoggedInGuard]},
  {path: 'font-choice', component: AAFontsComponent },
  {path: 'local-storage-error', component: ErrorLocalStorageComponent}, // no need for login here
  {path: 'out-of-time', component: OutOfTimeComponent },
  {path: 'qr', component: QrCodeArrivalComponent },
  {path: 'service-unavailable', component: WebsiteOfflineComponent },
  {path: 'session-expired', component: SessionExpiredComponent },
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-fail', component: LoginFailureComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-out', component: LogoutComponent, canActivate: [LoggedInGuard]},
  {path: 'submission-failed', component: SubmissionFailedComponent },
  {path: 'test-error', component: TestErrorComponent}, // no need for login here
  { path: '**', component: PageNotFoundComponent }
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
        PageVisibilityComponent,
        PracticeQuestionComponent,
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
        WebsiteOfflineComponent,
        TestErrorComponent,
        ErrorLocalStorageComponent,
        PageNotFoundComponent
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes, { enableTracing: false, relativeLinkResolution: 'legacy' } // <-- debugging purposes only
        ),
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
    ],
    providers: [
        AppConfigService,
        { provide: APP_INITIALIZER, useFactory: loadConfigService, deps: [AppConfigService], multi: true },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        AnswerService,
        ApplicationInsightsService,
        AppUsageService,
        AuditService,
        AuditEntryFactory,
        AzureQueueService,
        CanExitGuard,
        CheckCompleteService,
        CheckStartService,
        CheckStatusService,
        CookieService,
        DeviceService,
        FeedbackService,
        LoggedInGuard,
        LoginErrorDiagnosticsService,
        LoginErrorService,
        HttpService,
        PupilPrefsService,
        QuestionService,
        RegisterInputService,
        RouteService,
        SpeechService,
        StorageService,
        SubmissionService,
        TimerService,
        TokenService,
        UserService,
        WarmupQuestionService,
        WindowRefService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
