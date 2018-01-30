'use strict'

/* global describe it expect */

const roleService = require('../../services/role.service')

describe('nca-tools.service', () => {
  it('default to teacher when nca tools user type is not found', () => {
    const actual = roleService.mapNcaRoleToMtcRole('batman')
    expect(actual).toBe('TEACHER')
  })

  it('correctly maps all known roles', () => {
    expect(roleService.mapNcaRoleToMtcRole('SuperAdmin')).toBe('SERVICE-MANAGER')
    expect(roleService.mapNcaRoleToMtcRole('SuperUser')).toBe('HEADTEACHER')
    expect(roleService.mapNcaRoleToMtcRole('SchoolSup')).toBe('TEACHER')
    expect(roleService.mapNcaRoleToMtcRole('SchoolNom')).toBe('TEACHER')
    expect(roleService.mapNcaRoleToMtcRole('Admin')).toBe('HELPDESK')
    expect(roleService.mapNcaRoleToMtcRole('DataAdmin')).toBe('TEST-DEVELOPER')
  })
})
