'use strict';
const baseUrl = 'http://localhost:3001/auth';
const request = require('request');
const authForm = require('../../data/fixtures/ncatools-auth-form-data.js');
describe('nca tools authentication controller', function () {

  xit('logs a user on successfully', function (done) {
    request.post(baseUrl, {timeout: 200, form: authForm.data}, function (error, res, body) {
      if (error) {
        if (error.code = 'ECONNREFUSED') {
          console.log('skipping auth logon test as the server is not running')
          return done();
        }
        done(error);
      }
      expect(res.statusCode).toBe(302);
      expect(res.headers['location']).toBe('/school/school-home');
      done();
    });
  });

  xit('logs does not logon an invalid request', function (done) {
    request.post(baseUrl, {timeout: 200, form: {}}, function (error, res, body) {
      if (error) {
        if (error.code = 'ECONNREFUSED') {
          console.log('skipping auth logon test as the server is not running')
          return done();
        }
        done(error);
      }
      expect(res.statusCode).toBe(302);
      expect(res.headers['location']).toBe('/sign-in-failure');
      done();
    });
  });

})