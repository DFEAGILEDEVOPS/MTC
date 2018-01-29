'use strict'

/* global describe it expect */

const ncaToolsService = require('../../services/nca-tools.service')

describe('nca-tools.service', () => {
  it('default to teacher when nca tools user type is not found', () => {
    const actual = ncaToolsService.mapNcaRoleToMtcRole('batman')
    expect(actual).toBe('TEACHER')
  })

  it('correctly maps all known roles', () => {
    const mappings = {
      SuperAdmin: 'ADMINISTRATOR',
      SuperUser: 'HEADTEACHER',
      SchoolSup: 'TEACHER',
      SchoolNom: 'TEACHER',
      Admin: 'HELPDESK'
    }
    for (var ncaUserType in mappings) {
      // skip loop if the property is from prototype
      if (!mappings.hasOwnProperty(ncaUserType)) continue
      var mtcRole = mappings[ncaUserType]
      const actual = ncaToolsService.mapNcaRoleToMtcRole(ncaUserType)
      expect(actual).toBe(mtcRole)
    }
  })
})
