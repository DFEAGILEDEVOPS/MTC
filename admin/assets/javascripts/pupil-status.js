document.addEventListener('DOMContentLoaded', function () {
  window.MTCAdmin.tableSort.applySorting(window.document, 'pupil-status', {
    sortNullsLast: true,
    ignoredStrings: ['-']
  })
  window.MTCAdmin.pupilFilter()
})
