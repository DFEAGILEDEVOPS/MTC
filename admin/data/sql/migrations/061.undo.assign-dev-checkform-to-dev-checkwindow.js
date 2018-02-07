const config = require('../../../config')

module.exports.generateSql = () => {
  if (process.env.NODE_ENV !== 'production') {
    return `DELETE FROM [mtc_admin].[checkFormWindow];`
  }
}
