const isAuthenticated = require('../authentication/middleware')

const { getHome,
  getResults,
  downloadResults,
  generatePins,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted } = require('../controllers/school')

const school = (router) => {
  router.get('/school-home', isAuthenticated(), (req, res, next) => getHome(req, res, next))
  router.get('/results', isAuthenticated(), (req, res, next) => getResults(req, res, next))
  router.get('/download-results', isAuthenticated(), (req, res, next) => downloadResults(req, res, next))
  router.post('/generate-pins', isAuthenticated(), (req, res, next) => generatePins(req, res, next))
  router.get('/submit-attendance', isAuthenticated(), (req, res, next) => getSubmitAttendance(req, res, next))
  router.post('/submit-attendance-form', isAuthenticated(), (req, res, next) => postSubmitAttendance(req, res, next))
  router.get('/declaration-form', isAuthenticated(), (req, res, next) => getDeclarationForm(req, res, next))
  router.post('/submit-declaration-form', isAuthenticated(), (req, res, next) => postDeclarationForm(req, res, next))
  router.get('/declaration-form-submitted', isAuthenticated(), (req, res, next) => getHDFSubmitted(req, res, next))
}

module.exports = school
