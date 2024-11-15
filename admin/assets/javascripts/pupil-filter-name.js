/**
 * Filtering pupils by name.
 */
 
if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/* global $ stickyBanner inputStatus */
(function () {
  window.MTCAdmin.pupilFilter = function () {
    if ($('.filter-name').length > 0) {
      $('#search-name').on('change keyup', function () {
        var input = $.trim($(this).val()).toLowerCase()
        var selAllTr = 'table[data-name="filterablePupilsList"] > tbody > tr'
        if (input.length === 0) {
          $(selAllTr).each(function () {
            $(this).removeClass('filter-hidden-name')
          })

          stickyBanner.calculatePosition()
          return
        }

        $(selAllTr).each(function ($tr) {
          var pupilName = $('#pupilName', this).length > 0 && $.trim($('#pupilName', this).text()).toLowerCase()
          var pupilUpnEl = $('input[name=pupilUpn]', this)
          var pupilUpn = pupilUpnEl && pupilUpnEl.length > 0 && pupilUpnEl.val().toLowerCase()
          var searchTerm = input.toLowerCase()
          var isPupilExcluded =
            (!pupilName || pupilName.indexOf(searchTerm) < 0) &&
            (!pupilUpn || pupilUpn.indexOf(searchTerm) < 0)

          if (isPupilExcluded) {
            $(this).addClass('filter-hidden-name')
            // If the pupil that is being hidden is checked, then we should uncheck the pupil
            $(this).find('[type="checkbox"]').prop('checked', false)
          } else {
            $(this).removeClass('filter-hidden-name')
          }
        })

        stickyBanner.outputCheckedCheckboxes(inputStatus.countCheckedCheckboxes())
        stickyBanner.calculatePosition()
      })
      // Edge / IE hack to detect input clearing
      // See the bug at: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/17584515/
      $('#search-name').on('mouseup', function () {
        var $input = $(this)
        var oldVal = $input.val()
        if (oldVal.length === 0) return

        setTimeout(function () {
          if ($input.val().length === 0) {
            $input.trigger('keyup')
          }
        }, 1)
      })
    }
  }
})()
