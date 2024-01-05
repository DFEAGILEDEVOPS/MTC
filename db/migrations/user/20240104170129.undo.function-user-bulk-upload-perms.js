'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
return `-- REVOKE ALTER
        --    ON DATABASE SCOPED CREDENTIAL :: PsReportBulkUploadCredential
        --    TO  [${config.Sql.FunctionsApp.Username}];

        -- REVOKE ALTER ALTER ANY EXTERNAL DATA SOURCE
        --     TO [${config.Sql.FunctionsApp.Username}];
        `
}
