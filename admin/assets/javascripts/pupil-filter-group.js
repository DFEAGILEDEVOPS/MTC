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
        const groupId = $(this).val()
        groupIds.push(groupId)
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
      stickyBanner.toggle(inputStatus.countCheckedCheckboxes() || displayStickyBanner)
    })

    $('.filter-header').on('click', function (e) {
      $('.filter-label').toggleClass('active')
      $('#filter-content').toggleClass('js-filter-hidden-group')
    })

    $('.group-count').each(function () {
      var totalPupils = $('.' + this.id).length
      $('#' + this.id).text('(' + totalPupils + ' pupil' + (totalPupils === 1 ? '' : 's') + ')')
    })
  }
})
