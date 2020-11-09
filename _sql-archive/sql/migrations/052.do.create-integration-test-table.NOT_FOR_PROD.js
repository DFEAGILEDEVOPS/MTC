module.exports.generateSql = () => {
  if (process.env.NODE_ENV !== 'production') {
    return `
      CREATE TABLE [mtc_admin].[integrationTest] (
        id INT IDENTITY NOT NULL PRIMARY KEY,
        tDecimal DECIMAL(5, 2),
        tNumeric NUMERIC(5, 3),
        tFloat FLOAT(24),
        tNvarchar NVARCHAR(10)
      )`
  }
  return ''
}
