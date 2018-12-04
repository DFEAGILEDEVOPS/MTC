'use strict'

function validateMessage (preparedCheckSyncMessage) {
  if (!preparedCheckSyncMessage) {
    throw new Error('prepared-check-sync: Message missing')
  }

  if (!(typeof preparedCheckSyncMessage === 'object')) {
    throw new Error('prepared-check-sync: Message is invalid')
  }

  if (!preparedCheckSyncMessage.version) {
    throw new Error('prepared-check-sync: Message version is unspecified')
  }

  if (!preparedCheckSyncMessage.checkCode) {
    throw new Error('prepared-check-sync: Message is invalid: checkCode missing')
  }
}

module.exports = validateMessage
