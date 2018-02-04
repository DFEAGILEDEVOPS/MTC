/**
 * Global scripts.
 */
/* global $ */
$(function () {
  var groupFilters = {
    /**
     * Table row visibility.
     * @param groupIds
     */
    tableRowVisibility: function (groupIds) {
      var sel = '.spacious > tbody > tr'
      if (groupIds.length < 1) {
        $(sel).removeClass('hidden')
      } else {
        $(sel).addClass('hidden')
        groupIds.map(function (gId) {
          $(sel + '#group-id-' + gId).removeClass('hidden')
        })
        $(sel + '.hidden .multiple-choice-mtc > input:checkbox:checked').prop('checked', false)
      }
    },

    /**
     * Find active groups from URL.
     * @returns {string}
     */
    findActiveGroups: function () {
      var url = window.location.href
      if (url.lastIndexOf('/groupIds=') > 0) {
        return url.substr(url.lastIndexOf('/groupIds=') + 10, url.length)
      }
    },

    /**
     * Change checkbox status to 'checked' for passed groupIds.
     * @param groupIds
     * @returns {boolean}
     */
    checkGroupCheckbox: function (groupIds) {
      if (!groupIds) { return false }
      $('input[name="group"]').prop('checked', false).attr('data-checked', false)
      $(groupIds).each(function (key, value) {
        $('input[id="group-' + value + '"]').prop('checked', true).attr('data-checked', true)
      })
    },

    /**
     * Update sorting link to include active group ids.
     * @param action
     * @param groupId
     */
    updateSortingLink: function (action, groupId) {
      var sortingLink = $('#sortingLink')
      var insertGroupId = groupId + ','
      if (sortingLink) {
        if (action === 'add') {
          if (sortingLink.attr('href').indexOf('groupIds=') === -1) {
            sortingLink.attr('href', sortingLink.attr('href') + 'groupIds=')
          }
          sortingLink.attr('href', sortingLink.attr('href') + insertGroupId)
        } else if (action === 'remove') {
          sortingLink.attr('href', sortingLink.attr('href').replace(insertGroupId, ''))
        }
      }
    },

    /**
     * Set-up value of hidden field 'groupIds'.
     * @param action
     * @param groupId
     */
    setGroupIds: function (action, groupId) {
      var hiddenInput = $('input[name="groupIds"]')
      var insertGroupId = groupId + ','
      if (hiddenInput) {
        var hiddenInputVal = hiddenInput.val()
        if (action === 'add') {
          hiddenInput.val(hiddenInputVal + insertGroupId)
        } else if (action === 'remove') {
          hiddenInput.val(hiddenInputVal.replace(insertGroupId, ''))
        }
      }
    }
  }

  /**
   * Filtering pupils by group.
   */
  if ($('#filterByGroup').length > 0) {
    var groupIds = []
    var activeGroupsIds = groupFilterss.findActiveGroups()

    if (activeGroupsIds) {
      $('#filter-content').removeClass('hidden')
      var groupIdsArr = decodeURIComponent(activeGroupsIds).split(',')
      groupIdsArr.map(function (g) {
        groupIds.push(g)
      })
      groupFilters.checkGroupCheckbox(groupIdsArr)
      groupFilters.tableRowVisibility(groupIdsArr)
    }

    $('#filterByGroup input:checkbox').on('click', function (e) {
      // stickyBanner.stickyBannerPositioning()
      if ($(this).is(':checked')) {
        $(this).attr('data-checked', true)
        groupIds.push($(this).val())
        // groupFilters.setGroupIds('add', $(this).val())
        groupFilters.updateSortingLink('add', $(this).val())
      } else {
        $(this).attr('data-checked', false)
        groupIds.splice($.inArray($(this).val(), groupIds), 1)
        // groupFilters.setGroupIds('remove', $(this).val())
        groupFilters.updateSortingLink('remove', $(this).val())
      }
      console.log('===== GROUP IDS', groupIds)
      groupFilters.tableRowVisibility(groupIds)
    })

    $('.filter-header').on('click', function (e) {
      $('.filter-label').toggleClass('active')
      $('#filter-content').toggleClass('hidden')
    })
  }
})
