
module.exports.generateSql = () => {
  if (process.env.NODE_ENV !== 'production') {
    return 'DROP TABLE [mtc_admin].[integrationTest];'
  }
  return ''
}
