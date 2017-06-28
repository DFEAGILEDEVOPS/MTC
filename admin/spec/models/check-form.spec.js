'use strict';
const mongoose = require('mongoose');
const moment = require('moment');

// To check the pre-save functionality - this suite needs a connection to mongo.
let connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost/mtc';
mongoose.connect(connectionString, function(err) {
  if (err) {
    throw new Error('Could not connect to mongodb: ' + err.message);
  }
});

const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

// CheckForm depends on an initialized mongoose-auto-increment
const CheckForm = require('../../models/check-form');
const CheckWindow = require('../../models/check-window');


describe('check-form schema', function() {
  let checkForm;

  beforeEach(function() {
    checkForm = new CheckForm({
      questions: [
        {f1: 1, f2: 1},
        {f1: 1, f2: 2},
        {f1: 1, f2: 3},
        {f1: 12, f2: 12}
      ]
    });
  });

  it('correctly validates a valid model', function(done) {
    checkForm.validate(function(err) {
      expect(err).toBe(null);
      expect(checkForm._id).toBeUndefined();
      expect(checkForm.name).toBeUndefined();
     done();
    });
  });

  it('correctly saves a valid model', function(done) {
    checkForm.save(function(err, doc) {
      expect(err).toBe(null);
      expect(doc._id).toBeDefined();
      doc.remove();
      done();
    });
  });

  it('will overwrite a supplied name', function(done) {
    checkForm.name = 'JMS999';
    checkForm.save(function(err, doc) {
      expect(err).toBe(null);
      expect(doc.name).toBeDefined();
      expect(doc.name).not.toBe('JMS999');
      doc.remove();
      done();
    });
  });

  it('requires questions to be supplied', function(done) {
    checkForm.questions = undefined;
    checkForm.validate(function(err) {
      expect(err.errors).toBeDefined();
      expect(err.errors.questions).toBeDefined();
      done();
    });
  });

  it('requires factor1 to be supplied in the question', function(done) {
    checkForm.questions[0].f1 = undefined;
    checkForm.validate(function(err) {
      expect(err.errors).toBeDefined();
      expect(err.errors['questions.0.f1']).toBeDefined();
      done();
    });
  });

  it('requires factor2 to be supplied in the question', function(done) {
    checkForm.questions[0].f2 = undefined;
    checkForm.validate(function(err) {
      expect(err.errors).toBeDefined();
      expect(err.errors['questions.0.f2']).toBeDefined();
      done();
    });
  });

  it('requires factor1 to be above the low range', function(done) {
    checkForm.questions[0].f1 = 0;
    checkForm.validate(function(err) {
      expect(err.errors).toBeDefined();
      expect(err.errors['questions.0.f1']).toBeDefined();
      done();
    });
  });

  it('requires factor1 to be below the high range', function(done) {
    checkForm.questions[0].f1 = 13;
    checkForm.validate(function(err) {
      expect(err.errors).toBeDefined();
      expect(err.errors['questions.0.f1']).toBeDefined();
      done();
    });
  });

  it('requires factor2 to be above the low range', function(done) {
    checkForm.questions[0].f2 = 0;
    checkForm.validate(function(err) {
      expect(err.errors).toBeDefined();
      expect(err.errors['questions.0.f2']).toBeDefined();
      done();
    });
  });

  it('requires factor2 to be below the high range', function(done) {
    checkForm.questions[0].f2 = 13;
    checkForm.validate(function(err) {
      expect(err.errors).toBeDefined();
      expect(err.errors['questions.0.f2']).toBeDefined();
      done();
    });
  });

  it('has a method to mark a form as deleted', function(done) {
    expect(typeof checkForm.markAsDeleted).toBe('function');
    done();
  });

  it('marking the form as deleted returns a promise', function (done) {
    checkForm.markAsDeleted()
      .then(res => {
          done();
        },
        error => {
          done();
        });
  });

  it('marking the form as deleted rejects the promise if it doesnt get a CheckWindow model in arg1', function (done) {
    checkForm.markAsDeleted()
      .then( data => {
        done(new Error('Promise resolved when it was expected to fail'));
      },
      error => {
        done(); // success
      });
  });

  it('marking the form as deleted happy path', async function (done) {

    try {
      await checkForm.save()
    } catch (error) {
      return done(error);
    }

    checkForm.markAsDeleted(CheckWindow)
      .then( f => {
          expect(f.isDeleted).toBe(true);
          done(); // success
        },
        error => {
          done(error); // failure
        });
    await checkForm.remove();
  });

  it('getActiveForm should not return a deleted form', async function(done) {
    try {
      checkForm.isDeleted = true;
      await checkForm.save();
      const form = await CheckForm.getActiveForm(checkForm.id).exec();
      expect(form).toBe(null);
      await checkForm.remove();
    } catch (error) {
      done(error);
    }
    done();
  });

  it('getActiveForms should not return deleted forms', async function(done) {
    try {
      checkForm.isDeleted = true;
      await checkForm.save();
      const forms = await CheckForm.getActiveForms().exec();
      forms.forEach(f => {
        expect(f.id).not.toBe(checkForm.id);
      });
      await checkForm.remove();
    } catch (error) {
      done(error);
    }
    done();
  });

  it('cannot be marked as deleted if it is assigned to a Check Window that has already started', async function(done) {
    let checkWindow;

    try {
      await checkForm.save();

      checkWindow = new CheckWindow({
        name: 'Test check window already started',
        startDate: moment().subtract(1, 'week'),
        endDate: moment().add(1, 'week'),
        registrationStartDate: moment().subtract(2, 'weeks'),
        registrationEndDate: moment().add(1, 'week').subtract(1, 'day')
      });

      checkWindow.forms = [ checkForm._id ];

      await checkWindow.save();
    } catch (error) {
      done(error);
    }

    // This should fail as the form is assigned to a checkwindow that has already started.
    try {
      await checkForm.markAsDeleted(CheckWindow);
      await checkWindow.remove();
      await checkForm.remove();
      done(new Error('This should have a thrown an error'));
    } catch (error) {
      // expected success - the business validation is working
      expect(error.message).toMatch(/^Unable to delete checkform/);
      await checkWindow.remove();
      await checkForm.remove();
      done();
    }
  });

  it('can be marked as deleted if it is assigned to a Check Window that has NOT already started', async function(done) {
    let checkWindow;

    try {
      await checkForm.save();

      checkWindow = new CheckWindow({
        name: 'Test check window not yet started',
        startDate: moment().add(1, 'day'),
        endDate: moment().add(1, 'week'),
        registrationStartDate: moment().subtract(2, 'weeks'),
        registrationEndDate: moment().add(1, 'week').subtract(1, 'day')
      });

      checkWindow.forms = [ checkForm._id ];

      await checkWindow.save();
    } catch (error) {
      done(error);
    }

    // This should pass as the form is assigned to a check window that has not already started.
    try {
      checkForm = await checkForm.markAsDeleted(CheckWindow);
      expect(checkForm.isDeleted).toBe(true);
      await checkWindow.remove();
      await checkForm.remove();
      done();
    } catch (error) {
      await checkWindow.remove();
      await checkForm.remove();
      console.log(error);
      done(new Error('Expected to pass but an error was thrown'));
    }
  });

});