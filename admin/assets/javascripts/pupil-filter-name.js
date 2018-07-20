/**
 * Filtering pupils by name.
 */
/* global $ */
$(function () {
  if ($('.filter-name').length > 0) {
    $('#search-name').on('change keyup', function (e) {
      var input = $.trim($(e.currentTarget).val()).toLowerCase()
      var selAllTr = '#generatePins > tbody > tr'
      if (input.length === 0) {
        $(selAllTr).each(function () {
          $(this).removeClass('filter-hidden-name')
        })
        return
      }

      $(selAllTr).each(function () {
        if ($.trim($(this).text()).toLowerCase().indexOf(input) === -1) {
          $(this).addClass('filter-hidden-name')
        } else {
          $(this).removeClass('filter-hidden-name')
        }
      })
    })
  }
})
