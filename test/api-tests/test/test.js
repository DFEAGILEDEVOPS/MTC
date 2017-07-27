const should = require('chai').should(),
  supertest = require('supertest'),
  api = supertest('http://localhost:3001')

describe('Questions API', function () {
  it('returns questions as JSON', function () {
    return api.post('/api/questions')
      .set('Content-Type', 'application/json')
      .send({'schoolPin': 'abc12345', 'pupilPin': '9999a'})
      .expect(200)
      .then(response => {
        response.body.should.have.property('questions')
      })
  })
})
