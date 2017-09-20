const isAuthenticated = require('../authentication/middleware')
const config = require('../config')

const { getAddPupil,
  postAddPupil,
  getAddMultiple,
  getMultipleTemplate,
  getEditPupilById,
  postEditPupil,
  getManagePupils,
  getPrintPupils } = require('../controllers/pupil')

const pupil = (router) => {
  router.get('/pupil/add', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getAddPupil(req, res, next))
  router.post('/pupil/add', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postAddPupil(req, res, next))
  router.get('/pupil/add-multiples', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getAddMultiple(req, res, next))
  router.get('/pupil/download-multiple-template', isAuthenticated(config.ROLE_TEACHER), (req, res) => getMultipleTemplate(req, res))
  router.get('/pupil/edit/:id', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getEditPupilById(req, res, next))
  router.post('/pupil/edit', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postEditPupil(req, res, next))
  router.get('/manage-pupils', isAuthenticated(config.ROLE_TEACHER), isAuthenticated(), (req, res) => getManagePupils(req, res))
  router.get('/print-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getPrintPupils(req, res, next))
}

module.exports = pupil
