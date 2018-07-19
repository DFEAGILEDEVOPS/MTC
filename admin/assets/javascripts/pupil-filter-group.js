/**
 * Filtering pupils by group.
 */
/* global $, checkboxUtil, stickyBanner, inputStatus, pupilsNotTakingCheck, restarts */
$(function () {
  if ($('#filterByGroup').length > 0) {
    var groupIds = []
    $('#filterByGroup input:checkbox').on('click', function (e) {
      if ($(this).is(':checked')) {
        $(this).attr('data-checked', true)
        groupIds.push($(this).val())
      } else {
        $(this).attr('data-checked', false)
        groupIds.splice($.inArray($(this).val(), groupIds), 1)
      }
      checkboxUtil.tableRowVisibility('group', groupIds)

      /* Sticky banner interaction */
      stickyBanner.outputCheckedCheckboxes(inputStatus.countCheckedCheckboxes())
      stickyBanner.positioning()
      var displayStickyBanner = false
      if ($('#pupils-not-taking-checks').length > 0) {
        displayStickyBanner = pupilsNotTakingCheck.isCheckboxChecked()
      }
      if ($('#pupilsRestartList').length > 0) {
        displayStickyBanner = restarts.validateForm()
      }
      stickyBanner.toggle(displayStickyBanner)
    })

    $('.filter-header').on('click', function (e) {
      $('.filter-label').toggleClass('active')
      $('#filter-content').toggleClass('hidden')
    })

    $('.group-count').each(function () {
      var totalPupils = $('.' + $(this).context.id).length
      $('#' + $(this).context.id).text('(' + totalPupils + ' pupil' + (totalPupils > 1 ? 's' : '') + ')')
    })
  }
})
