'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
return `-- GRANT ALTER
        --    ON DATABASE SCOPED CREDENTIAL :: PsReportBulkUploadCredential
        --    TO  [${config.Sql.FunctionsApp.Username}];

        -- GRANT ALTER ANY EXTERNAL DATA SOURCE TO [${config.Sql.FunctionsApp.Username}];
        `
}
