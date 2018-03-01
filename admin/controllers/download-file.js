'use strict'

module.exports = async (req, res) => {
  const fileName = 'MTC_CAG_Feb_2018_Trial.pdf'
  res.setHeader('Content-disposition', 'filename=' + fileName)
  res.setHeader('Content-type', 'application/pdf')
  res.download('public/PDFs/' + fileName)
}
