'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    REVOKE SELECT,UPDATE,INSERT ON [mtc_admin].[school] TO [${config.Sql.FunctionsApp.Username}];
    GO
    REVOKE UPDATE ON [mtc_admin].[job] TO [${config.Sql.FunctionsApp.Username}];
    GO
    REVOKE SELECT ON [mtc_admin].[jobStatus] TO [${config.Sql.FunctionsApp.Username}];
    GO
    REVOKE UPDATE,INSERT ON [mtc_admin].[pupil] TO [${config.Sql.FunctionsApp.Username}];
    GO
    REVOKE CONTROL ON schema::[mtc_census_import] TO [${config.Sql.FunctionsApp.Username}];
    GO
    REVOKE CREATE TABLE TO [${config.Sql.FunctionsApp.Username}];
    GO

    DECLARE @sql NVARCHAR(4000) = ''

    SELECT @sql += 'DROP TABLE ' + '[mtc_census_import].' + QUOTENAME(table_name) + ';'
    from information_schema.tables
    where table_schema = 'mtc_census_import'
    and table_type = 'BASE TABLE'

    -- PRINT @sql
    Exec sp_executesql @sql
    GO

    DROP SCHEMA [mtc_census_import];
    `
}
