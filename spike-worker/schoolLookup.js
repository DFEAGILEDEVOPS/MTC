const schoolDataService = require('../admin/services/data-access/school.data.service')

module.exports = async (csvPayload) => {
  // Fetch all school for pupil records
  let schoolDfeNumbers = csvPayload.map(r => `${r[0]}${r[1]}`)
  // filter duplicate entries
  schoolDfeNumbers = schoolDfeNumbers.filter((item, pos, self) => self.indexOf(item) === pos)
  return schoolDataService.sqlFindByDfeNumbers(schoolDfeNumbers)
}
