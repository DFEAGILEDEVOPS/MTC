const rolesConfig = require('../roles-config')
const isAuthenticated = require('../authentication/middleware')

const { getHome,
  getPupils,
  getResults,
  downloadResults,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted,
  getPupilNotTakingCheck,
  getSelectPupilNotTakingCheck,
  savePupilNotTakingCheck,
  removePupilNotTakingCheck,
  viewPupilsNotTakingTheCheck } = require('../controllers/school')
const group = require('../controllers/group.js')

const school = (router) => {
  router.get('/school-home', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getHome(req, res, next))
  router.get('/pupil-register/:sortField/:sortDirection', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getPupils(req, res, next))
  router.get('/results', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getResults(req, res, next))
  router.get('/download-results', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => downloadResults(req, res, next))
  router.get('/submit-attendance', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSubmitAttendance(req, res, next))
  router.post('/submit-attendance-form', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => postSubmitAttendance(req, res, next))
  router.get('/declaration-form', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getDeclarationForm(req, res, next))
  router.post('/submit-declaration-form', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => postDeclarationForm(req, res, next))
  router.get('/declaration-form-submitted', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getHDFSubmitted(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils/:groupIds?', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/select-pupils/:sortField/:sortDirection/:groupIds?', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/save-pupils', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getSelectPupilNotTakingCheck(req, res, next))
  router.post('/pupils-not-taking-check/save-pupils', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => savePupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/remove/:pupilId', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => removePupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/view', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => viewPupilsNotTakingTheCheck(req, res, next))
  router.get('/pupils-not-taking-check', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getPupilNotTakingCheck(req, res, next))
  router.get('/pupils-not-taking-check/:removed', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getPupilNotTakingCheck(req, res, next))
  router.get('/group-pupils', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => group.groupPupilsPage(req, res, next))
  router.get('/group-pupils/add', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => group.manageGroupPage(req, res, next))
  router.get('/group-pupils/edit/:groupId', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => group.manageGroupPage(req, res, next))
  router.post('/group-pupils/add', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => group.addGroup(req, res, next))
  router.post('/group-pupils/edit', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => group.editGroup(req, res, next))
  router.get('/group-pupils/delete/:groupId', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => group.removeGroup(req, res, next))
}

module.exports = school
