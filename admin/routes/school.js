const config = require('../config')
const isAuthenticated = require('../authentication/middleware')

const { getHome,
  getPupils,
  getResults,
  downloadResults,
  getGeneratePinsOverview,
  getGeneratePinsList,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted,
  getPupilNotTakingCheck,
  getSelectPupilNotTakingCheck,
  savePupilNotTakingCheck,
  removePupilNotTakingCheck } = require('../controllers/school')

const school = (router) => {
  router.get('/school-home', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getHome(req, res, next))
  router.get('/pupil-register/:sortColumn/:sortOrder', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getPupils(req, res, next))
  router.get('/results', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getResults(req, res, next))
  router.get('/download-results', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => downloadResults(req, res, next))
  router.get('/generate-pins-overview', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getGeneratePinsOverview(req, res))
  router.get('/generate-pins-list/:sortField/:sortDirection', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getGeneratePinsList(req, res, next))
  router.get('/submit-attendance', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSubmitAttendance(req, res, next))
  router.post('/submit-attendance-form', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postSubmitAttendance(req, res, next))
  router.get('/declaration-form', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getDeclarationForm(req, res, next))
  router.post('/submit-declaration-form', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postDeclarationForm(req, res, next))
  router.get('/declaration-form-submitted', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getHDFSubmitted(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils/:sortField/:sortDirection', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/save-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.post('/pupils-not-taking-check/save-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => savePupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/remove/:pupilId', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => removePupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/:removed', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getPupilNotTakingCheck(req, res, next))
}

module.exports = school
