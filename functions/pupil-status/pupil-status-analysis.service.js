'use strict'

module.exports = {
  /**
   * Re-compute the status of a single pupil.
   *
   * @param data
   * @return {string}
   *
   * Data Format - where the check and restart data are taken from the most recent live check / restart
   { pupil_id: 12,
   pupilStatusCode: 'UNALLOC',
   check_id: 1,
   checkStatusCode: 'NEW',
   pupilAttendance_id: null,
   pupilRestart_id: 1,
   pupilRestart_check_id: null }

   */
  analysePupilData: function analysePupilData (data) {
    if (!data) {
      throw new Error('No data provided')
    }

    if (Array.isArray(data)) {
      throw new Error('data is an array')
    }

    if (typeof data !== 'object') {
      throw new Error('data is not an object')
    }

    const lastCheckTaken = data

    // Please see the query for how this data structure is generated (multi-way sql join)
    // Attendance codes override all checks (should any have been taken), so this gets checked early.
    if (lastCheckTaken.pupilAttendance_id) {
      return 'NOT_TAKING'
    }

    // Check for unconsumed restarts
    if (lastCheckTaken.pupilRestart_id && lastCheckTaken.pupilRestart_check_id === null) {
      return 'UNALLOC'
    }

    switch (lastCheckTaken.checkStatusCode) {
      case null:
        return 'UNALLOC'
      case 'NEW':
        return 'ALLOC'
      case 'COL':
        return 'LOGGED_IN'
      case 'STD':
        return 'STARTED'
      case 'CMP':
        return 'COMPLETED'
      case 'EXP':
        return 'UNALLOC'
      case 'NTR':
        return 'STARTED'
    }

    // default
    return 'UNALLOC'
  }
}
