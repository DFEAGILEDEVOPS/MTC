
module.exports.generateSql = () => {
  if (process.env.NODE_ENV !== 'production') {
    return `
    INSERT INTO [mtc_admin].[checkFormWindow] (checkForm_id, checkWindow_id)
        VALUES (
          (SELECT id FROM [mtc_admin].[checkForm] WHERE name = 'MTC0100'),
          (SELECT id FROM [mtc_admin].[checkWindow] WHERE name = 'Development Phase')
        )
  `
  }
  return ''
}
