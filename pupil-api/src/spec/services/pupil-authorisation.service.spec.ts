'use strict'

/* global describe */

import { pupilAuthenticationService } from '../../services/pupil-authentication.service'

describe('pupilAuthenticationService', () => {

  const dummyDriver = {
    retrieveEntityAsync: jasmine.createSpy().and.returnValue(Promise.resolve({}))
  }

  it('makes a call to retriveEntityAsync', async () => {
    await pupilAuthenticationService.authenticate('1234', 'pin1', dummyDriver)
    expect(dummyDriver.retrieveEntityAsync).toHaveBeenCalled()
  })
})
