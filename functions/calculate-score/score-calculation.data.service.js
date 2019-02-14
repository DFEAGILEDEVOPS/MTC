const { TYPES } = require('tedious')
const sqlService = require('less-tedious')

const schema = '[mtc_admin]'
const schoolScoreTable = '[schoolScore]'
const checkWindowTable = '[checkWindow]'

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
    name: 'checkWindow_id',
    value: checkWindowId,
    type: TYPES.Int
  })
  const sql = `
  DELETE FROM ${schema}.${schoolScoreTable}
  WHERE checkWindow_id = @checkWindow_id
  
  DECLARE @schoolScoreDataCursor CURSOR;
  DECLARE @checkWindowId INT = @checkWindow_id
  DECLARE @schoolId INT
  DECLARE @schoolScore DECIMAL(5,2)
  BEGIN
     SET @schoolScoreDataCursor = CURSOR FOR
      SELECT * from ${schema}.vewSchoolsAverage  
     OPEN @schoolScoreDataCursor
     FETCH NEXT FROM @schoolScoreDataCursor
     INTO @schoolId, @schoolScore
     WHILE @@FETCH_STATUS = 0
     BEGIN
       INSERT INTO ${schema}.${schoolScoreTable} (checkWindow_id, school_id, score)
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

/**
 * Store national average in check window score
 * @param {Number} checkWindowId
 * @return {Promise<Array>}
 */
module.exports.sqlInsertCheckWindowScore = async (checkWindowId) => {
  const params = []
  params.push({
    name: 'checkWindowId',
    value: checkWindowId,
    type: TYPES.Int
  })
  const sql = `
  UPDATE ${schema}.${checkWindowTable}
  SET score = (
    SELECT AVG(score) 
    FROM ${schema}.${schoolScoreTable}
    WHERE checkWindow_id = @checkWindowId
  )
  WHERE id = @checkWindowId
  `
  return sqlService.modifyWithTransaction(sql, params)
}
