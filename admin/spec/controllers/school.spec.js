'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise
const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const School = require('../../models/school')
const Pupil = require('../../models/pupil')
const pupilValidator = require('../../lib/validator/pupil-validator')
const ValidationError = require('../../lib/validation-error')

describe('school controller:', () => {

})
