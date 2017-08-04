import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Http } from '@angular/http';
const auth_token = 'auth_token';

@Injectable()
export class UserService {
  private loggedIn = false;
  private apiURL = 'http://localhost:3001'
  data: any = {}

  constructor(private http: Http) {
    this.loggedIn = !!localStorage.getItem(auth_token);
  }

  // getData(schoolPin, pupilPin) {
  //   return
  // }

  login(schoolPin, pupilPin) {
    return new Promise( async(resolve, reject) => {
      let data;
      let err;
      await this.http.post(`${this.apiURL}/api/questions`,
        {schoolPin, pupilPin},
        {params: {'Content-Type': 'application/json'}})
        .toPromise()
        .then((response) => {
          if (response.status === 200) {
            data = response.json()
            this.loggedIn = true;
            localStorage.setItem(auth_token, data['pupil'].sessionId);
            localStorage.setItem('data', JSON.stringify(data))
          } else reject('Login Error')
        }).catch(error => err = error)
      if (err) return reject(err);
      if (data) return resolve(data);
    });
  }

  logout() {
    localStorage.removeItem(auth_token);
    localStorage.removeItem('data');
    this.loggedIn = false;
  }

  isLoggedIn() {
    return this.loggedIn;
  }
}
