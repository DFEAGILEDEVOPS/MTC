import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-logout',
  template: ``
})
export class LogoutComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router,
    private questionService: QuestionService
  ) {
    this.userService.logout();
    this.questionService.reset();
    this.router.navigate([ 'sign-in' ]);
  }

  ngOnInit() {
  }

}
