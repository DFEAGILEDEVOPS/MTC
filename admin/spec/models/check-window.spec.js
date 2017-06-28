'use strict';
const moment = require('moment');

// CheckForm depends on an initialized mongoose-auto-increment
const CheckWindow = require('../../models/check-window');
const CheckForm = require('../../models/check-form');

describe('check-window schema', function() {

  let checkWindow;

  beforeEach(function() {
    checkWindow = new CheckWindow({
      name: 'Test check window',
      startDate: moment(),
      endDate: moment().add('6', 'weeks'),
      registrationStartDate: moment(),
      registrationEndDate: moment().add('5', 'weeks')
    });

  });

  it('should allow a valid object', function(done) {
    checkWindow.validate(function(error) {
      expect(error).toBe(null);
      done();
    });
  });

  it('requires a name property', function(done) {
    checkWindow.name = undefined;
    checkWindow.validate( error => {
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      done();
    });
  });

  it('requires a startDate property', function(done) {
    checkWindow.startDate = undefined;
    checkWindow.validate( error => {
      expect(error).toBeDefined();
      expect(error.errors.startDate).toBeDefined();
      done();
    });
  });

  it('requires an endDate property', function(done) {
    checkWindow.endDate = undefined;
    checkWindow.validate( error => {
      expect(error).toBeDefined();
      expect(error.errors.endDate).toBeDefined();
      done();
    });
  });

  it('requires a registrationStartDate property', function(done) {
    checkWindow.registrationStartDate = undefined;
    checkWindow.validate( error => {
      expect(error).toBeDefined();
      expect(error.errors.registrationStartDate).toBeDefined();
      done();
    });
  });

  it('requires a registrationEndDate property', function(done) {
    checkWindow.registrationEndDate = undefined;
    checkWindow.validate( error => {
      expect(error).toBeDefined();
      expect(error.errors.registrationEndDate).toBeDefined();
      done();
    });
  });

  it('requires the endDate to be after the startDate', function(done){
    checkWindow.startDate = moment();
    checkWindow.endDate = moment().subtract(1, 'day');
    checkWindow.validate(function(error) {
      expect(error).toBeDefined();
      expect(error.errors.endDate).toBeDefined();
      done();
    });
  });

  it('requires the registrationEndDate to be after the registrationStartDate', function(done){
    checkWindow.registrationStartDate = moment();
    checkWindow.registrationEndDate = moment().subtract(1, 'second');
    checkWindow.validate(function(error) {
      expect(error).toBeDefined();
      expect(error.errors.registrationEndDate).toBeDefined();
      done();
    });
  });

  // requires db access
  it('allows a form to be assigned to the check window', async function(done) {
    const forms = await CheckForm.find({}).sort({createdAt: -1}).exec();
    if (forms.length === 0 ) {
      done(new Error ("There are no existing forms"));
    }
    checkWindow.forms[0] = forms[0]._id;
    checkWindow.validate(error => {
      expect(error).toBe(null);
      done();
    });
  });

  // requires db access
  it('allows more than one form to be assigned to the check window', async function(done) {
    const forms = await CheckForm.find({}).sort({createdAt: -1}).exec();
    if (forms.length < 3 ) {
      done(new Error ("At least 3 existing forms are required."));
    }
    checkWindow.forms[0] = forms[0]._id;
    checkWindow.forms[1] = forms[1]._id;
    checkWindow.forms[2] = forms[2]._id;

    checkWindow.validate(error => {
      expect(error).toBe(null);
      done();
    });
  });

  it('prevents an invalid type from being saved as a form ref', function(done) {
    checkWindow.forms[0] = 'MTC001';
    checkWindow.validate(error => {
      expect(error.errors['forms.0']).toBeDefined();
      done();
    });
  });

  it('provides a method to show all check windows that each form has',  function(done) {
    CheckWindow.getCheckWindowsAssignedToForms()
      .then(data => {
        expect(data).toBeDefined();
        done();
      },
      error => {
        done('The promise was rejected');
      });
  });
});
