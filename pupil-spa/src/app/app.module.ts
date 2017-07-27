import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
    { path: 'sign-in', component: LoginComponent },
    // { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
      RouterModule.forRoot(
          appRoutes,
          { enableTracing: true } // <-- debugging purposes only
      ),
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
