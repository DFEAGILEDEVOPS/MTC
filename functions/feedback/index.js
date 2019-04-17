'use strict'

const uuid = require('uuid/v4')
const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

const sqlUtil = require('../lib/sql-helper')
const schema = '[mtc_admin]'
const feedbackTable = '[pupilFeedback]'

module.exports = async function (context, feedbackMessage) {
  if (typeof feedbackMessage !== 'object') {
    throw new Error('Badly formed message')
  }

  context.log('feedback: message received', feedbackMessage.checkCode)
  // TODO: purpose: process feedback messages and put into pupilEvents table

  try {
    await sqlSaveFeedback(feedbackMessage)
  } catch (error) {
    context.log.error(`feedback: Failed to save feedback for checkCode [${feedbackMessage.checkCode}]`)
    throw error
  }

  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: feedbackMessage.checkCode,
    RowKey: uuid(),
    eventType: 'feedback',
    payload: JSON.stringify(feedbackMessage),
    processedAt: new Date()
  }
  context.bindings.pupilEventsTable.push(entity)
}

async function sqlSaveFeedback (feedbackMessage) {
  const check = await sqlUtil.sqlFindCheckByCheckCode(feedbackMessage.checkCode)
  if (!check) {
    throw new Error(`feedback: sqlSaveFeedback(): check not found for checkCode [${feedbackMessage.checkCode}]`)
  }
  const feedbackData = convertMessageToDataObject(feedbackMessage)
  const sql = `INSERT INTO ${schema}.${feedbackTable} (check_id, inputType, satisfactionRating, comments) VALUES (@p1, @p2, @p3, @p4)`
  const params = [
    {
      name: 'p1',
      value: check.id,
      type: TYPES.Int
    },
    {
      name: 'p2',
      value: feedbackData.inputType,
      type: TYPES.Int
    },
    {
      name: 'p3',
      value: feedbackData.satisfactionRating,
      type: TYPES.Int
    },
    {
      name: 'p4',
      value: feedbackData.comments,
      type: TYPES.NVarChar
    }
  ]
  await sqlService.modify(sql, params)
}

function convertMessageToDataObject (message) {
  return {
    inputType: message.inputType,
    satisfactionRating: message.satisfactionRating,
    comments: message.comments
  }
}
