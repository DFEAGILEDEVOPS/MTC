'use strict'

module.exports = async (req, res) => {
  res.setHeader('Content-disposition', 'filename=multiple_pupils_errors.csv')
  res.setHeader('Content-type', 'application/pdf')
  res.download('public/PDFs/MTC_CAG_Feb_2018_Trial.pdf')
}
