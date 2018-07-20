/**
 * Write to Table Storage from a queue for pupil authentication
 * @param context
 * @param {} prepareCheckMessage
 */
module.exports = function (context, prepareCheckMessage) {
  context.log.verbose('prepareCheck, got message from prepare-check queue', prepareCheckMessage)

  context.bindings.preparedCheckTable = []

  const preparedCheck = {
    partitionKey: prepareCheckMessage.schoolPin,
    rowKey: prepareCheckMessage.pupilPin,
    questions: prepareCheckMessage.questions,
    pupil: prepareCheckMessage.pupil,
    school: prepareCheckMessage.school,
    config: prepareCheckMessage.config,
    tokens: {
      sasToken: prepareCheckMessage.sasToken,
      jwtToken: prepareCheckMessage.jwtToken
    },
    isCollected: false,
    hasCheckStarted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Happy path - write to Table Storage
  context.log('prepareCheck: saving to table storage: ', preparedCheck)
  context.bindings.preparedCheckTable.push(preparedCheck)
  context.done()
}
