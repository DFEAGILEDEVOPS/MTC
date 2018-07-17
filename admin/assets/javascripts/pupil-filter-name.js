/**
 * Filtering pupils by name.
 */
/* global $ */
$(function () {
  if ($('.filter-name').length > 0) {
    $('#search-name').on('change keyup', function (e) {
      var input = $.trim($(e.currentTarget).val())
      var selAllTr = '#generatePins > tbody > tr'
      if (input.length === 0) {
        $(selAllTr).each(function () {
          $(this).show()
        })
        return
      }

      $(selAllTr).each(function () {
        if ($.trim($(this).text()).indexOf(input) === -1) {
          $(this).hide()
        } else {
          $(this).show()
        }
      })
    })
  }
})
