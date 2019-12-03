document.addEventListener('DOMContentLoaded', function () {
  window.MTCAdmin.tableSort.setup(window.document, 'generatePins', {
    sortNullsLast: true,
    ignoredStrings: []
  }, 'pinSlips')
  window.MTCAdmin.pupilFilter()
})
