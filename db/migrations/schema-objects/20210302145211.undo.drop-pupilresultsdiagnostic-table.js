'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `
      CREATE TABLE mtc_admin.pupilResultsDiagnosticCache
      (
          id int identity
              constraint PK_pupilResultsDiagnosticCache_id
                  primary key nonclustered,
          school_id int not null,
          payload nvarchar(max) not null
      );
      go
      
      GRANT DELETE on mtc_admin.pupilResultsDiagnosticCache to [${config.Sql.Application.Username}];
      go
  `
}
