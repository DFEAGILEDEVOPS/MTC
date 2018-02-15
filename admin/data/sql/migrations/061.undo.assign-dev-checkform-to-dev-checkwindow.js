
module.exports.generateSql = () => {
  if (process.env.NODE_ENV !== 'production') {
    return `
    DELETE 
    FROM [mtc_admin].[checkFormWindow] 
    WHERE
     checkForm_id IN (SELECT id FROM [mtc_admin].[checkForm] WHERE name = 'MTC0100')
    AND checkWindow_id IN (SELECT id FROM [mtc_admin].[checkWindow] WHERE name = 'Development Phase')`
  }
  return ''
}
