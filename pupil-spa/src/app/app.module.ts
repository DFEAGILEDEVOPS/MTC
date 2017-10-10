import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger/dist';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnswerService } from './services/answer/answer.service';
import { AppComponent } from './app.component';
import { AuditService } from './services/audit/audit.service';
import { CheckCompleteComponent } from './check-complete/check-complete.component';
import { CheckComponent } from './check/check.component';
import { environment } from '../environments/environment';
import { FeedbackComponent } from './feedback/feedback.component';
import { FeedbackService } from './services/feedback/feedback.service';
import { FeedbackThanksComponent } from './feedback-thanks/feedback-thanks.component';
import { HeaderComponent } from './header/header.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { LoadingComponent } from './loading/loading.component';
import { LoggedInGuard } from './logged-in.guard';
import { LoginComponent } from './login/login.component';
import { LoginFailureComponent } from './login-failure/login-failure.component';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { LogoutComponent } from './logout/logout.component';
import { QuestionComponent } from './question/question.component';
import { QuestionService } from './services/question/question.service';
import { RegisterInputService} from './services/register-input/registerInput.service';
import { StorageService } from './services/storage/storage.service';
import { SubmissionService} from './services/submission/submission.service';
import { UserService } from './services/user/user.service';
import { WarmupCompleteComponent } from './warmup-complete/warmup-complete.component';
import { WarmupIntroComponent } from './warmup-intro/warmup-intro.component';
import { WarmupQuestionService } from './services/question/warmup-question.service';

const appRoutes: Routes = [
  {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
  {path: 'check', component: CheckComponent, canActivate: [LoggedInGuard]},
  {path: 'check-start', component: InstructionsComponent, canActivate: [LoggedInGuard]},
  {path: 'feedback', component: FeedbackComponent},
  {path: 'feedback-thanks', component: FeedbackThanksComponent},
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-out', component: LogoutComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-in-failure', component: LoginFailureComponent},
  {path: 'warm-up-intro', component: WarmupIntroComponent, canActivate: [LoggedInGuard]},
  {path: 'warm-up-start', component: LoadingComponent, canActivate: [LoggedInGuard]},
  {path: 'warm-up-question', component: QuestionComponent, canActivate: [LoggedInGuard]},
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
    LoginFailureComponent,
    LoginSuccessComponent,
    LogoutComponent,
    QuestionComponent,
    WarmupCompleteComponent,
    WarmupIntroComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: false} // <-- debugging purposes only
    ),
    FormsModule,
    BrowserModule,
    HttpModule,
    LoggerModule.forRoot({
      level: environment.production ? NgxLoggerLevel.ERROR : NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.OFF
    })
  ],
  providers: [
    AnswerService,
    AuditService,
    FeedbackService,
    LoggedInGuard,
    QuestionService,
    StorageService,
    SubmissionService,
    UserService,
    WarmupQuestionService,
    RegisterInputService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
