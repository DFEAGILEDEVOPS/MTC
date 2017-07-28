import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {RouterModule, Routes} from '@angular/router';
import {UserService} from './user.service';
import {LoginSuccessComponent} from './login-success/login-success.component';
import {LogoutComponent} from './logout/logout.component';
import {LoginFailureComponent} from './login-failure/login-failure.component';

const appRoutes: Routes = [
  {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
  {path: 'sign-in', component: LoginComponent},
  {path: 'sign-in-success', component: LoginSuccessComponent},
  {path: 'sign-out', component: LogoutComponent},
  {path: 'sign-in-failure', component: LoginFailureComponent}
  // { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginSuccessComponent,
    LogoutComponent,
    LoginFailureComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true} // <-- debugging purposes only
    ),
    BrowserModule
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})

export class AppModule {
}
