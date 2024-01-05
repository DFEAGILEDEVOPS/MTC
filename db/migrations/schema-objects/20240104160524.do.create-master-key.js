'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
	// For dev environments no master password has been set in Docker.  Create one if there isn't one present.
 return `
 IF (
	SELECT
		COUNT(*)
	FROM
		sys.symmetric_keys
	WHERE
		name LIKE '%DatabaseMasterKey%'
) = 0
BEGIN
	CREATE MASTER KEY ENCRYPTION BY PASSWORD = '${config.Sql.Migrator.Password}';
END
 `
}
