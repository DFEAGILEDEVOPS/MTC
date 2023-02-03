'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const serviceManagerController = require('../controllers/service-manager')

/* Service Manager routing */
router.get('/home',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getServiceManagerHome
)

router.get('/check-settings',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getUpdateTiming
)

router.get('/check-settings/:status',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getUpdateTiming
)

router.post('/check-settings',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.setUpdateTiming
)

router.get('/upload-pupil-census',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getUploadPupilCensus
)

router.post('/upload-pupil-census/upload',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.postUploadPupilCensus
)

router.get('/upload-pupil-census/delete/:pupilCensusId',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getRemovePupilCensus
)

router.get('/mod-settings',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getSceSettings
)

router.post('/mod-settings',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.postSceSettings
)

router.get('/mod-settings/cancel',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.cancelSceSettings
)

router.get('/mod-settings/add-school',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getSceAddSchool
)

router.post('/mod-settings/add-school',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.postSceAddSchool
)

router.get('/mod-settings/remove-school/:urn',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getSceRemoveSchool
)

router.get('/organisations',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getManageSchools
)

router.get('/organisations/add',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getAddSchool
)

router.post('/organisations/add',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.postAddSchool
)

router.get('/organisations/search',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getSearch
)

router.post('/organisations/search',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.postSearch
)

router.get('/organisations/upload/:jobSlug?',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getUploadOrganisations
)

router.post('/organisations/upload',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.postUploadOrganisations
)

router.get(
  '/organisations/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getViewOrganisation
)

router.get('/organisations/:slug/edit',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.getEditOrganisation
)

router.post('/organisations/:slug/edit',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.postEditOrganisation
)

router.get('/job/:slug',
  isAuthenticated(roles.serviceManager),
  serviceManagerController.downloadJobOutput
)

router.get(
  '/audit-payload',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getAuditPayload
)

router.get(
  '/jobs',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getJobs
)

router.get(
  '/job-outputs',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getJobOutputs
)

router.get('/pupil/move/:pupilSlug/confirm/:schoolSlug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getPupilMoveConfirm
)

router.post('/pupil/move/:pupilSlug/confirm/:schoolSlug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.postPupilMoveConfirmed
)

router.get('/pupil/move/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getPupilMove
)

router.post('/pupil/move/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.postPupilMove
)

router.get('/pupil-search',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getPupilSearch
)

router.post('/pupil-search',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.postPupilSearch
)

router.get('/pupil-summary/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getPupilSummary
)

router.get('/annul-pupil/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getPupilAnnulment
)

router.post('/annul-pupil/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.postPupilAnnulment
)

router.get('/annul-pupil-undo/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.getPupilAnnulmentUndo
)

router.post('/annul-pupil-undo/:slug',
  isAuthenticated([roles.serviceManager]),
  serviceManagerController.postPupilAnnulmentUndo
)

module.exports = router
