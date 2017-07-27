const should = require('chai').should(),
  supertest = require('supertest'),
  api = supertest('http://localhost:3001')

describe('Questions API', function () {
  it('returns questions as JSON', function (done) {
    api.post('/api/questions')
      .set('Content-Type', 'application/json')
      .send({ "schoolPin": "abc12345", "pupilPin": "9999a" })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        res.body.should.have.property('questions')
        done()
      })
  })
})
