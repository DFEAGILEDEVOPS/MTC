document.addEventListener('DOMContentLoaded', function () {
  window.MTCAdmin.tableSort.applySorting(window.document, 'generatePins', {
    sortNullsLast: true,
    ignoredStrings: []
  })
  window.MTCAdmin.pupilFilter()
})
