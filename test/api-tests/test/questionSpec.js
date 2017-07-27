const chai = require('chai'),
  supertest = require('supertest'),
  api = supertest('http://localhost:3001'),
  expect = chai.expect

describe('Questions API', function () {
  context('POST request to /api/questions', function () {
    it('returns questions set payload as JSON', function () {
      return api.post('/api/questions')
        .set('Content-Type', 'application/json')
        .send({'schoolPin': 'abc12345', 'pupilPin': '9999a'})
        .then(response => {
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('Object')
          expect(response.body).to.have.property('questions').with.lengthOf(20)
          expect(response.body.pupil.firstName).to.equal('Automated')
          expect(response.body.pupil.lastName).to.equal('Account')
          expect(response.body.school.id).to.equal(9991999)
          expect(response.body.school.name).to.equal('Test school')
          expect(response.body.config.questionTime).to.equal(5)
          expect(response.body.config.loadingTime).to.equal(2)
        })
    })
  })
  context('GET request to /api/questions', function () {
    it('returns 404 Not Found', function () {
      return api.get('/api/questions')
        .then(response => {
          expect(response.statusCode).to.equal(404)
        })
    })
  })
  context('POST request to /api/questions with no pupil pin', function () {
    it('returns 400 Bad Request ', function () {
      return api.post('/api/questions')
        .send({'schoolPin': 'abc12345'})
        .then(response => {
          expect(response.statusCode).to.equal(400)
        })
    })
  })
  context('POST request to /api/questions with no school pin', function () {
    it('returns 400 Bad Request ', function () {
      return api.post('/api/questions')
        .send({'pupilPin': '9999a'})
        .then(response => {
          expect(response.statusCode).to.equal(400)
        })
    })
  })
  context('POST request to /api/questions with invalid school pin and pupil pin combination ', function () {
    it('returns 401 Unauthorised ', function () {
      return api.post('/api/questions')
        .send({'schoolPin': '12345', 'pupilPin': '9999a'})
        .then(response => {
          expect(response.statusCode).to.equal(401)
        })
    })
  })
})
