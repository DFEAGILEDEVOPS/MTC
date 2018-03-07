'use strict'

module.exports = async (req, res) => {
  const fileName = 'mtc-administration-guidance-2018-03.pdf'
  res.setHeader('Content-disposition', 'filename=' + fileName)
  res.setHeader('Content-type', 'application/pdf')
  res.download('public/pdfs/' + fileName)
}
