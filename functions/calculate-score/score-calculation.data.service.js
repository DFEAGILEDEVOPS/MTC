const { TYPES } = require('tedious')
const sqlService = require('less-tedious')
const R = require('ramda')

const schema = '[mtc_admin]'
const checkWindowTable = '[checkWindow]'
const schoolScoreTable = '[schoolScore]'

/**
 * Find a check window within the score calculation period
 * @return {Object}
 */
module.exports.sqlFindCalculationPeriodCheckWindow = async () => {
  const sql = `
  SELECT * from ${schema}.${checkWindowTable}
  WHERE GETUTCDATE() BETWEEN checkStartDate AND adminEndDate`
  const res = await sqlService.query(sql)
  return R.head(res)
}

/**
 * Fetch school average scores for active check window
 * @return {Promise<Array>}
 */
module.exports.sqlFindCheckWindowSchoolAverageScores = async () => {
  const sql = `SELECT * FROM ${schema}.[vewSchoolsAverage]`
  return sqlService.query(sql)
}

/**
 * Save school scores for check window id
 * @param {Number} checkWindowId
 * @return {Promise<Array>}
 */
module.exports.sqlInsertSchoolScores = async (checkWindowId) => {
  const params = []
  params.push({
    name: `checkWindow_id`,
    value: checkWindowId,
    type: TYPES.Int
  })
  const sql = `
  DELETE FROM [mtc_admin].[schoolScore]
  WHERE checkWindow_id = @checkWindow_id
  
  DECLARE @schoolScoreDataCursor CURSOR;
  DECLARE @checkWindowId INT = @checkWindow_id
  DECLARE @schoolId INT
  DECLARE @schoolScore DECIMAL(5,2)
  BEGIN
     SET @schoolScoreDataCursor = CURSOR FOR
      SELECT * from [mtc_admin].vewSchoolsAverage  
     OPEN @schoolScoreDataCursor
     FETCH NEXT FROM @schoolScoreDataCursor
     INTO @schoolId, @schoolScore
     WHILE @@FETCH_STATUS = 0
     BEGIN
       INSERT INTO [mtc_admin].[schoolScore] (checkWindow_id, school_id, score)
       VALUES (@checkWindowId, @schoolId, @schoolScore)
       FETCH NEXT FROM @schoolScoreDataCursor
       INTO @schoolId, @schoolScore
     END;
     CLOSE @schoolScoreDataCursor;
     DEALLOCATE @schoolScoreDataCursor;
  END;
  `
  return sqlService.modifyWithTransaction(sql, params)
}
