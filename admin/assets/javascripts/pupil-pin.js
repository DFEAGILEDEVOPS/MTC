document.addEventListener('DOMContentLoaded', function () {
  window.MTCAdmin.tableSort.applySorting(window.document, 'generatePins', {
    sortNullsLast: false,
    ignoredStrings: []
  })
  window.MTCAdmin.pupilFilter()
})
