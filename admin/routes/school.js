const config = require('../config')
const isAuthenticated = require('../authentication/middleware')

const { getHome,
  getPupils,
  getResults,
  downloadResults,
  generatePins,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted,
  getPupilNotTakingCheck,
  getSelectPupilNotTakingCheck } = require('../controllers/school')

const school = (router) => {
  router.get('/school-home', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getHome(req, res, next))
  router.get('/pupil-register/:sortColumn/:sortOrder', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getPupils(req, res, next))
  router.get('/results', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getResults(req, res, next))
  router.get('/download-results', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => downloadResults(req, res, next))
  router.post('/generate-pins', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => generatePins(req, res, next))
  router.get('/submit-attendance', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSubmitAttendance(req, res, next))
  router.post('/submit-attendance-form', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postSubmitAttendance(req, res, next))
  router.get('/declaration-form', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getDeclarationForm(req, res, next))
  router.post('/submit-declaration-form', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postDeclarationForm(req, res, next))
  router.get('/declaration-form-submitted', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getHDFSubmitted(req, res, next))
  router.get('/pupils-not-taking-check', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils/:sortField/:sortOrder', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
}

module.exports = school
