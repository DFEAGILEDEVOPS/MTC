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

const appRoutes: Routes = [
  {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent},
  {path: 'sign-out', component: LogoutComponent},
  {path: 'sign-in-failure', component: LoginFailureComponent},
  {path: 'check-start', component: InstructionsComponent},
  {path: 'warm-up-intro', component: WarmupIntroComponent},
  {path: 'warm-up-start', component: LoadingComponent},
  {path: 'warm-up-question', component: QuestionComponent},
  {path: 'check/complete', component: CheckCompleteComponent}
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
  providers: [UserService],
  bootstrap: [AppComponent]
})

export class AppModule {
}
