const config = require('../config')
const rolesConfig = require('../roles-config')
const isAuthenticated = require('../authentication/middleware')

const { getHome,
  getPupils,
  getResults,
  downloadResults,
  getGeneratePinsOverview,
  getGeneratePinsList,
  postGeneratePins,
  getGeneratedPinsList,
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
  router.get('/school-home', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getHome(req, res, next))
  router.get('/pupil-register/:sortColumn/:sortOrder', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getPupils(req, res, next))
  router.get('/results', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getResults(req, res, next))
  router.get('/download-results', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => downloadResults(req, res, next))
  router.get('/generate-pins-overview', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getGeneratePinsOverview(req, res, next))
  router.get('/generate-pins-list/:sortField/:sortDirection', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getGeneratePinsList(req, res, next))
  router.post('/generate-pins', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => postGeneratePins(req, res, next))
  router.get('/generated-pins-list', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getGeneratedPinsList(req, res, next))
  router.get('/submit-attendance', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSubmitAttendance(req, res, next))
  router.post('/submit-attendance-form', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => postSubmitAttendance(req, res, next))
  router.get('/declaration-form', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getDeclarationForm(req, res, next))
  router.post('/submit-declaration-form', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => postDeclarationForm(req, res, next))
  router.get('/declaration-form-submitted', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getHDFSubmitted(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils/:sortField/:sortDirection', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/save-pupils', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.post('/pupils-not-taking-check/save-pupils', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => savePupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/remove/:pupilId', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => removePupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/:removed', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getPupilNotTakingCheck(req, res, next))
}

module.exports = school
