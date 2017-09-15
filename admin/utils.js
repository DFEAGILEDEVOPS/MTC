const sortRecords = (dataObj, column, order) => {
  const sorted = order === true
    ? dataObj.sort((a, b) => (a[column] > b[column] ? 1 : (a[column] === b[column] ? 0 : -1)))
    : dataObj.sort((a, b) => (a[column] < b[column] ? 1 : (a[column] === b[column] ? 0 : -1)))
  return sorted
}

module.exports = {
  sortRecords
}
