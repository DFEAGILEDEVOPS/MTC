document.addEventListener('DOMContentLoaded', function () {
  window.MTCAdmin.tableSort.applySorting(window.document, 'register-pupils', {
    sortNullsLast: true,
    ignoredStrings: ['-']
  })
  window.MTCAdmin.pupilFilter()

  $(function() {
    $('input[type=checkbox][name=optcol]').change(function() {
        if ($(this).is(':checked')) {
            if (this.value === 'upn') {
              showUpnCol()
            } else if (this.value === 'group') {
              showGroupCol()
            }
        } else {
          if (this.value === 'upn') {
            hideUpnCol()
          } else if (this.value === 'group') {
            hideGroupCol()
          }
        }
    });
  });
})

function showUpnCol() {
  $('#jqUpnHeader').removeClass('hidden');
  $('.jqUpnRow').removeClass('hidden');
}

function hideUpnCol() {
  $('#jqUpnHeader').addClass('hidden');
  $('.jqUpnRow').addClass('hidden');
}

function showGroupCol() {
  $('#jqGroupHeader').removeClass('hidden');
  $('.jqGroupRow').removeClass('hidden');
}

function hideGroupCol() {
  $('#jqGroupHeader').addClass('hidden');
  $('.jqGroupRow').addClass('hidden');
}
