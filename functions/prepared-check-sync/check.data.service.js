const R = require('ramda')
const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

/**
 * Find latest live and single try out checkCode for a particular pupil based on one of the pupil's checkCodes
 * @param checkCode
 * @return {Promise<Array>}
 */
module.exports.sqlFindActiveCheckCodesByCheckCode = async function (checkCode) {
  const sql = `          
  DECLARE
      @pupilId INT = (SELECT pupil_id
                      FROM [mtc_admin].[check] chk
                      WHERE chk.checkCode = @checkCode)
  
  SELECT
     latestLivePupilCheck.checkCode AS livePupilCheckCode,
     latestTryOutPupilCheck.checkCode AS tryOutPupilCheckCode
  FROM [mtc_admin].[check] chk
  LEFT JOIN (
      SELECT
          chk2.checkCode,
          chk2.pupil_id,
          ROW_NUMBER() OVER ( PARTITION BY chk2.pupil_id ORDER BY chk2.id DESC ) as rank
      FROM [mtc_admin].[check] chk2
      JOIN [mtc_admin].checkStatus cs
          ON cs.id = chk2.checkStatus_id
      WHERE chk2.isLiveCheck = 1
      AND cs.code NOT IN ('CMP', 'EXP', 'NTR')
  ) latestLivePupilCheck
      ON latestLivePupilCheck.pupil_id = @pupilId and latestLivePupilCheck.rank = 1
  LEFT JOIN (
      SELECT
          chk3.checkCode,
          chk3.pupil_id,
          ROW_NUMBER() OVER ( PARTITION BY chk3.pupil_id ORDER BY chk3.id DESC ) as rank
      FROM [mtc_admin].[check] chk3
      JOIN [mtc_admin].checkStatus cs2
          ON cs2.id = chk3.checkStatus_id
      WHERE chk3.isLiveCheck = 0
      AND cs2.code NOT IN ('EXP')
  ) latestTryOutPupilCheck
      ON latestTryOutPupilCheck.pupil_id = @pupilId AND latestTryOutPupilCheck.rank = 1
  GROUP BY latestLivePupilCheck.checkCode, latestTryOutPupilCheck.checkCode
  `

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const result = await sqlService.query(sql, params)
  return Object.values(R.filter(c => !!c, R.head(result)))
}
