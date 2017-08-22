import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CheckCompleteComponent } from './check-complete/check-complete.component';
import { CheckComponent } from './check/check.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { LoadingComponent } from './loading/loading.component';
import { LoggedInGuard } from './logged-in.guard';
import { LoginComponent } from './login/login.component';
import { LoginFailureComponent } from './login-failure/login-failure.component';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { LogoutComponent } from './logout/logout.component';
import { PhaseBannerComponent } from './phase-banner/phase-banner.component';
import { QuestionComponent } from './question/question.component';
import { QuestionService } from './question.service';
import { StorageService } from './storage.service';
import { AnswerService } from './answer.service';
import { UserService } from './user.service';
import { WarmupIntroComponent } from './warmup-intro/warmup-intro.component';
import { AuditService } from './audit.service';

const appRoutes: Routes = [
  {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-out', component: LogoutComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-in-failure', component: LoginFailureComponent},
  {path: 'check', component: CheckComponent, canActivate: [LoggedInGuard]},
  {path: 'check-start', component: InstructionsComponent, canActivate: [LoggedInGuard]},
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
    FooterComponent,
    HeaderComponent,
    InstructionsComponent,
    LoadingComponent,
    LoginComponent,
    LoginFailureComponent,
    LoginSuccessComponent,
    LogoutComponent,
    PhaseBannerComponent,
    QuestionComponent,
    WarmupIntroComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true} // <-- debugging purposes only
    ),
    FormsModule,
    BrowserModule,
    HttpModule,
  ],
  providers: [
    LoggedInGuard,
    QuestionService,
    StorageService,
    UserService,
    AuditService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
