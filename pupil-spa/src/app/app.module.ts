import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { GlobalErrorHandler } from './error-handler';

import { AppConfigService, loadConfigService } from './services/config/config.service';

import { AnswerService } from './services/answer/answer.service';
import { AppComponent } from './app.component';
import { AuditService } from './services/audit/audit.service';
import { CheckCompleteComponent } from './check-complete/check-complete.component';
import { CheckComponent } from './check/check.component';
import { DeviceService } from './services/device/device.service';
import { FeedbackComponent } from './feedback/feedback.component';
import { FeedbackService } from './services/feedback/feedback.service';
import { FeedbackThanksComponent } from './feedback-thanks/feedback-thanks.component';
import { HeaderComponent } from './header/header.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { LoadingComponent } from './loading/loading.component';
import { LoggedInGuard } from './logged-in.guard';
import { LoginComponent } from './login/login.component';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { LogoutComponent } from './logout/logout.component';
import { QuestionComponent } from './question/question.component';
import { QuestionService } from './services/question/question.service';
import { RegisterInputService} from './services/register-input/registerInput.service';
import { SoundComponent } from './sound/sound.component';
import { SpeechService } from './services/speech/speech.service';
import { StorageService } from './services/storage/storage.service';
import { SubmissionService} from './services/submission/submission.service';
import { UserService } from './services/user/user.service';
import { WarmupCompleteComponent } from './warmup-complete/warmup-complete.component';
import { WarmupIntroComponent } from './warmup-intro/warmup-intro.component';
import { WarmupLoadingComponent } from './warmup-loading/warmup-loading.component';
import { WarmupQuestionService } from './services/question/warmup-question.service';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { AppUsageService } from './services/app-usage/app-usage.service';
import { TokenService } from './services/token/token.service';
import { AzureQueueService } from './services/azure-queue/azure-queue.service';

import { CheckStatusService } from './services/check-status/check-status.service';
import { PracticeQuestionComponent } from './practice-question/practice-question.component';
import { SpokenPracticeQuestionComponent } from './spoken-practice-question/spoken-practice-question.component';
import { SpokenQuestionComponent } from './spoken-question/spoken-question.component';
import { SubmissionFailedComponent } from './submission-failed/submission-failed.component';
import { SubmissionPendingComponent } from './submission-pending/submission-pending.component';
import { QuestionsIntroComponent } from './questions-intro/questions-intro.component';
import { FamiliarisationAreaComponent } from './familiarisation-area/familiarisation-area.component';
import { FamiliarisationSettingsComponent } from './familiarisation-settings/familiarisation-settings.component';
import { FamiliarisationColourComponent } from './familiarisation-colour/familiarisation-colour.component';
import { PageModificationsComponent } from './page-modifications/page-modifications.component';


const appRoutes: Routes = [
  {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
  {path: 'check', component: CheckComponent, canActivate: [LoggedInGuard]},
  {path: 'check-start', component: InstructionsComponent, canActivate: [LoggedInGuard]},
  {path: 'feedback', component: FeedbackComponent},
  {path: 'feedback-thanks', component: FeedbackThanksComponent},
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-out', component: LogoutComponent, canActivate: [LoggedInGuard]},
  {path: 'check-complete', component: CheckCompleteComponent },
  {path: 'submission-failed', component: SubmissionFailedComponent },
  {path: 'font-choice', component: FamiliarisationAreaComponent },
  {path: 'colour-choice', component: FamiliarisationColourComponent },
  {path: 'access-settings', component: FamiliarisationSettingsComponent }
  // { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    CheckCompleteComponent,
    CheckComponent,
    FeedbackComponent,
    FeedbackThanksComponent,
    HeaderComponent,
    InstructionsComponent,
    LoadingComponent,
    LoginComponent,
    LoginSuccessComponent,
    LogoutComponent,
    PracticeQuestionComponent,
    QuestionComponent,
    SoundComponent,
    SpokenPracticeQuestionComponent,
    SpokenQuestionComponent,
    SubmissionFailedComponent,
    SubmissionPendingComponent,
    WarmupCompleteComponent,
    WarmupIntroComponent,
    WarmupLoadingComponent,
    QuestionsIntroComponent,
    FamiliarisationAreaComponent,
    FamiliarisationColourComponent,
    FamiliarisationSettingsComponent,
    PageModificationsComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: false} // <-- debugging purposes only
    ),
    FormsModule,
    BrowserModule,
    HttpModule,
    HttpClientModule,
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics], {
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
    SubmissionService,
    UserService,
    WarmupQuestionService,
    WindowRefService,
    CheckStatusService,
    AppUsageService,
    TokenService,
    AzureQueueService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
