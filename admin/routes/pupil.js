const isAuthenticated = require('../authentication/middleware')

const { getAddPupil,
  postAddPupil,
  getEditPupilById,
  postEditPupil,
  getManagePupils,
  getPrintPupils } = require('../controllers/pupil')

const pupil = (router) => {
  router.get('/pupil/add', isAuthenticated(), (req, res, next) => getAddPupil(req, res, next))
  router.post('/pupil/add', isAuthenticated(), (req, res, next) => postAddPupil(req, res, next))
  router.get('/pupil/edit/:id', (req, res, next) => getEditPupilById(req, res, next))
  router.post('/pupil/edit', (req, res, next) => postEditPupil(req, res, next))
  router.get('/manage-pupils', isAuthenticated(), (req, res) => getManagePupils(req, res))
  router.get('/print-pupils', isAuthenticated(), (req, res, next) => getPrintPupils(req, res, next))
}

module.exports = pupil
