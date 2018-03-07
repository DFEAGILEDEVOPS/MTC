'use strict'

module.exports = async (req, res) => {
  const fileName = 'mtc_cag_feb_2018_trial.pdf'
  res.setHeader('Content-disposition', 'filename=' + fileName)
  res.setHeader('Content-type', 'application/pdf')
  res.download('public/pdfs/' + fileName)
}
