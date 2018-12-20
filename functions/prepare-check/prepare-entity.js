'use strict'

const azure = require('azure-storage')
const entGen = azure.TableUtilities.entityGenerator
const moment = require('moment')
const R = require('ramda')

/**
 * Return an entity suitable for inserting into the `preparedCheck` table
 * @param preparedCheck
 * @return {{PartitionKey: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<string>, RowKey: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<string>, checkCode: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<any>, collectedAt: null, config: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<string>, createdAt: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<Date>, isCollected: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<boolean>, pinExpiresAt: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<Date>, pupil: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<string>, pupilId: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<number>, questions: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<string>, school: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<string>, schoolId: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<number>, tokens: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<string>, updatedAt: azurestorage.services.table.TableUtilities.entityGenerator.EntityProperty<Date>}}
 */
function prepareEntity (preparedCheck) {
  const entity = {
    PartitionKey: entGen.String(preparedCheck.schoolPin),
    RowKey: entGen.String('' + preparedCheck.pupilPin),
    checkCode: entGen.Guid(preparedCheck.pupil.checkCode),
    collectedAt: null,
    config: entGen.String(JSON.stringify(preparedCheck.config)),
    createdAt: entGen.DateTime(new Date()),
    isCollected: entGen.Boolean(false),
    pinExpiresAt: entGen.DateTime(moment(preparedCheck.pupil.pinExpiresAt).toDate()),
    pupil: entGen.String(JSON.stringify(R.omit(['id', 'checkFormAllocationId', 'pinExpiresAt'], preparedCheck.pupil))),
    pupilId: entGen.Int32(preparedCheck.pupil.id),
    questions: entGen.String(JSON.stringify(preparedCheck.questions)),
    school: entGen.String(JSON.stringify(preparedCheck.school)),
    schoolId: entGen.Int32(preparedCheck.school.id),
    tokens: entGen.String(JSON.stringify(preparedCheck.tokens)),
    updatedAt: entGen.DateTime(new Date())
  }
  return entity
}

module.exports = prepareEntity
