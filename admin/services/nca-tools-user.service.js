'use strict'

const service = {
  /**
   * @description maps an authenticated NCA Tools user to an MTC user, school and role
   * @param {object} ncaUser all decrypted user information sent in the request payload
   */
  mapNcaUserToMtcUser: async (ncaUser) => {
    // TODO role mapping removed from authenticate, check it exists
    // TODO data.logonAt removed, ensure its added when adminLogonEvent persisted
    // TODO persist nca tools session token (best place might be adminLogonEvent?)
    // ...
  }
}

module.exports = service
