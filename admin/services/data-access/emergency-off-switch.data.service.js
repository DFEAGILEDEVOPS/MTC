'use strict'

const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')

const emergencyOffSwitchDataService = {}

emergencyOffSwitchDataService.sqlFindOne = async () => {
  const rows = await sqlService.query(`
    SELECT [isEnabled], [updatedAt], [updatedBy_userId]
    FROM [mtc_admin].[emergencyOffSwitch]
    WHERE [id] = 1
  `)
  return rows[0]
}

emergencyOffSwitchDataService.sqlUpdate = async (isEnabled, userId) => {
  const sql = `
    UPDATE [mtc_admin].[emergencyOffSwitch]
    SET
      [isEnabled] = @isEnabled,
      [updatedAt] = SYSUTCDATETIME(),
      [updatedBy_userId] = @userId
    WHERE [id] = 1
      AND [isEnabled] <> @isEnabled;

    IF @@ROWCOUNT = 1
    BEGIN
      INSERT INTO [mtc_admin].[emergencyOffSwitchLog] ([isEnabled], [changedBy_userId])
      VALUES (@isEnabled, @userId);
    END
    ELSE IF NOT EXISTS (
      SELECT 1 FROM [mtc_admin].[emergencyOffSwitch] WHERE [id] = 1
    )
    BEGIN
      THROW 51000, 'Emergency off-switch state row is missing.', 1;
    END
  `
  const params = [
    {
      name: 'isEnabled',
      value: isEnabled,
      type: TYPES.Bit
    },
    {
      name: 'userId',
      value: userId,
      type: TYPES.Int
    }
  ]
  return sqlService.modifyWithTransaction(sql, params)
}

module.exports = emergencyOffSwitchDataService
