const isAuthenticated = require('../authentication/middleware')
const config = require('../config')

const { getAddPupil,
  postAddPupil,
  getAddMultiplePupils,
  postAddMultiplePupils,
  getAddMultiplePupilsCSVTemplate,
  getErrorCSVFile,
  getEditPupilById,
  postEditPupil,
  getPrintPupils } = require('../controllers/pupil')

const pupil = (router) => {
  router.get('/pupil/add', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getAddPupil(req, res, next))
  router.post('/pupil/add', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postAddPupil(req, res, next))
  router.get('/pupil/add-batch-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getAddMultiplePupils(req, res, next))
  router.post('/pupil/add-batch-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postAddMultiplePupils(req, res, next))
  router.get('/pupil/download-multiple-template', isAuthenticated(config.ROLE_TEACHER), (req, res) => getAddMultiplePupilsCSVTemplate(req, res))
  router.get('/pupil/download-error-csv', isAuthenticated(config.ROLE_TEACHER), (req, res) => getErrorCSVFile(req, res))
  router.get('/pupil/edit/:id', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getEditPupilById(req, res, next))
  router.post('/pupil/edit', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => postEditPupil(req, res, next))
  router.get('/print-pupils', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getPrintPupils(req, res, next))
}

module.exports = pupil
