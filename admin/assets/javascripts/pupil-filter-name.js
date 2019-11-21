/**
 * Filtering pupils by name.
 */

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/* global $ stickyBanner */
(function () {
  window.MTCAdmin.pupilFilter = function () {
    if ($('.filter-name').length > 0) {
      $('#search-name').on('change keyup', function () {
        var input = $.trim($(this).val()).toLowerCase()
        var selAllTr = 'table > tbody > tr'
        if (input.length === 0) {
          $(selAllTr).each(function () {
            $(this).removeClass('filter-hidden-name')
          })

          stickyBanner.calculatePosition()
          return
        }

        $(selAllTr).each(function () {
          const pupilName = $('#pupilName', this).length > 0 && $.trim($('#pupilName', this).text()).toLowerCase()
          const pupilUpn = $('#pupilUpn', this).length > 0 && $('#pupilUpn', this).val().toLowerCase()
          const searchTerm = input.toLowerCase()
          const isPupilExcluded =
            (!pupilName || pupilName.indexOf(searchTerm) < 0) &&
            (!pupilUpn || pupilUpn.indexOf(searchTerm) < 0)

          if (isPupilExcluded) {
            $(this).addClass('filter-hidden-name')
          } else {
            $(this).removeClass('filter-hidden-name')
          }
        })

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
