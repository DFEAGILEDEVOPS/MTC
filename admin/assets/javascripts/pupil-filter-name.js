/**
 * Filtering pupils by name.
 */
/* global $ stickyBanner */
$(function () {
  if ($('.filter-name').length > 0) {
    $('#search-name').on('change keyup', function () {
      var input = $.trim($(this).val()).toLowerCase()
      var selAllTr = '#generatePins > tbody > tr'
      if (input.length === 0) {
        $(selAllTr).each(function () {
          $(this).removeClass('filter-hidden-name')
        })

        stickyBanner.resetDocumentHeight()
        stickyBanner.calculatePosition()
        return
      }

      $(selAllTr).each(function () {
        if ($.trim($('td > label', this).text()).toLowerCase().indexOf(input) === -1) {
          $(this).addClass('filter-hidden-name')
        } else {
          $(this).removeClass('filter-hidden-name')
        }
      })

      stickyBanner.resetDocumentHeight()
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
})
