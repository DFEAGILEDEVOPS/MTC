document.addEventListener('DOMContentLoaded', function () {
  window.MTCAdmin.tableSort.applySorting(window.document, 'register-pupils', {
    sortNullsLast: true,
    ignoredStrings: ['-']
  })
  window.MTCAdmin.pupilFilter()
})
