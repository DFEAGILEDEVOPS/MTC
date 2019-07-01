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
    DECLARE @pupilId INT = ( SELECT pupil_id FROM mtc_admin.[check] chk WHERE chk.checkCode = '4386DD00-7E8B-4454-A5A5-4D19E852C275' )

    SELECT
       latestLivePupilCheck.checkCode AS livePupilCheckCode,
       tryOutPupilCheck.checkCode AS tryOutPupilCheckCode
    FROM [mtc_admin].[check] chk
    LEFT JOIN (
        SELECT
            chk2.checkCode,
            chk2.pupil_id,
            ROW_NUMBER() OVER ( PARTITION BY chk2.pupil_id ORDER BY chk2.id DESC ) as rank
        FROM [mtc_admin].[check] chk2
        WHERE chk2.isLiveCheck = 1
    ) latestLivePupilCheck
        ON latestLivePupilCheck.pupil_id = @pupilId and latestLivePupilCheck.rank = 1
    LEFT JOIN (
        SELECT
            chk3.checkCode,
            chk3.pupil_id
        FROM [mtc_admin].[check] chk3
        WHERE chk3.isLiveCheck = 0
    ) tryOutPupilCheck
        ON tryOutPupilCheck.pupil_id = @pupilId
    GROUP BY latestLivePupilCheck.checkCode, tryOutPupilCheck.checkCode
  `

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const result = await sqlService.query(sql, params)
  return Object.values(R.head(result))
}
