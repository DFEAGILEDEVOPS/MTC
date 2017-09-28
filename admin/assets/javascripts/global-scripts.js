/**
 * Global scripts.
 */
/* global $ */
$(function () {
  function tickAllCheckboxes (sel, e) {
    $('#tickAllCheckboxes').on('change', function () {
      $(sel + ' > tbody div > input:checkbox').not('[disabled]').prop('checked', ($(this).is(':checked')))
      if ($('#selectAll')) {
        console.log('SELECT ALL', $(this).is(':checked'))
        if ($(this).is(':checked') === true) {
          console.log('HIDE SELECT ALL')
          $('#selectAll').addClass('all-hide')
          $('#unselectAll').removeClass('all-hide')
        } else {
          console.log('SHOW SELECT ALL')
          $('#unselectAll').addClass('all-hide')
          $('#selectAll').removeClass('all-hide')
        }
      }
    })
  }

  function disableCheckAll (sel, e) {
    if ($(sel)) {
      var lengthAll = $(sel + ' > tbody div > input:checkbox').length
      var lengthChecked = $(sel + ' > tbody div > input:checkbox:disabled').length

      if (lengthAll === lengthChecked) {
        $('#tickAllCheckboxes').prop('disabled', true)
      } else {
        $('#tickAllCheckboxes').prop('disabled', false)
      }
    }
  }

  if ($('#checkFormsList').length > 0) tickAllCheckboxes('#checkFormsList')
  if ($('#pupilsList').length > 0) tickAllCheckboxes('#pupilsList')
  if ($('#attendanceList').length > 0)tickAllCheckboxes('#attendanceList')

  if ($('#checkFormsList').length > 0) disableCheckAll('#checkFormsList')
  if ($('#pupilsList').length > 0) disableCheckAll('#pupilsList')
  if ($('#attendanceList').length > 0) disableCheckAll('#attendanceList')

  $('#selectAll').on('click', function (e) {
    $(this).addClass('all-hide')
    $('#unselectAll').removeClass('all-hide')
  })

  $('#unselectAll').on('click', function (e) {
    $(this).addClass('all-hide')
    $('#selectAll').removeClass('all-hide')
  })

  var stickyHeaderEl2 = $('#stickyHeader')
  console.log('FOO', stickyHeaderEl2)

  $(window).scroll(function () {
    var stickyHeaderEl = $('#stickyHeader')
    var stickyBannerHeight = 156
    //if (stickyBannerHeight === null) {
    //  stickyBannerHeight = stickyHeaderEl.offset().top
    //}
    if ($(window).scrollTop() > stickyBannerHeight) {
      stickyHeaderEl.css({
        position: 'fixed',
        top: '0px',
        width: stickyHeaderEl.width()
      })
    } else {
      stickyHeaderEl.removeAttr('style')
    }
  })

  $('input:file').on('change', function (e) {
    e.stopPropagation()
    $('input:submit').prop('disabled', !$(this).val())
  })
})
