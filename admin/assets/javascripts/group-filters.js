/**
 * Global scripts.
 */
/* global $ */
$(function () {
  /**
   * Filtering pupils by group.
   */
  if ($('#filterByGroup').length > 0) {
    var groupIds = []
    $('#filterByGroup input:checkbox').on('click', function (e) {
      if ($(this).is(':checked')) {
        groupIds.push($(this).val())
      } else {
        groupIds.splice($.inArray($(this).val(), groupIds), 1)
      }
      tableRowVisibility(groupIds)
    })

    $('.filter-header').on('click', function (e) {
      $('.filter-label').toggleClass('active')
      $('.filter-content').toggleClass('hidden')
    })
  }

  function tableRowVisibility (groupIds) {
    var sel = '#pupilsList > tbody > tr'
    if (groupIds.length < 1) {
      $(sel).removeClass('hidden')
    } else {
      $(sel).addClass('hidden')
      groupIds.map(function (gId) {
        $(sel + '#group-id-' + gId).removeClass('hidden')
      })
      $(sel + '.hidden .multiple-choice-mtc > input:checkbox:checked').prop('checked', false)
    }
  }
})
