import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {UserService} from './user.service';
import {LoginSuccessComponent} from './login-success/login-success.component';
import {LogoutComponent} from './logout/logout.component';
import {LoginFailureComponent} from './login-failure/login-failure.component';
import { LoadingComponent } from './loading/loading.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { WarmupIntroComponent } from './warmup-intro/warmup-intro.component';
import { QuestionComponent } from './question/question.component';
import {CheckCompleteComponent} from './check-complete/check-complete.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PhaseBannerComponent } from './phase-banner/phase-banner.component';
import {LoggedInGuard} from './logged-in.guard';
import { StorageService } from './storage.service';

const appRoutes: Routes = [
  {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent, canActivate: [LoggedInGuard]},
  {path: 'sign-out', component: LogoutComponent,  canActivate: [LoggedInGuard]},
  {path: 'sign-in-failure', component: LoginFailureComponent},
  {path: 'check-start', component: InstructionsComponent, canActivate: [LoggedInGuard]},
  {path: 'warm-up-intro', component: WarmupIntroComponent, canActivate: [LoggedInGuard]},
  {path: 'warm-up-start', component: LoadingComponent, canActivate: [LoggedInGuard]},
  {path: 'warm-up-question', component: QuestionComponent, canActivate: [LoggedInGuard]},
  {path: 'check/complete', component: CheckCompleteComponent, canActivate: [LoggedInGuard]}
  // { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginSuccessComponent,
    LogoutComponent,
    LoginFailureComponent,
    LoadingComponent,
    InstructionsComponent,
    WarmupIntroComponent,
    QuestionComponent,
    CheckCompleteComponent,
    HeaderComponent,
    FooterComponent,
    PhaseBannerComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true} // <-- debugging purposes only
    ),
    FormsModule,
    BrowserModule
  ],
  providers: [UserService, LoggedInGuard, StorageService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
