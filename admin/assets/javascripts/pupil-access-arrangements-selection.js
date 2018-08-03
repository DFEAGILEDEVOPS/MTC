/**
 * Pupil access arrangements selection
 */
/* global $ */
$(function () {
  'use strict'
  var accessArrangementsList = ('#accessArrangementsList')
  var questionReaderOtherInformation = $('#questionReaderOtherInformation')
  $(accessArrangementsList).find('input:checkbox').click(function (i) {
    var el = i.currentTarget
    if (el.checked && (el.value === 'ITA' || el.value === 'QNR')) {
      $(el).closest('li').find('.hide-checkbox-content').addClass('show-checkbox-content')
      $(el).closest('li').find('.hide-checkbox-content').removeClass('hide-checkbox-content')
    }
    if (!el.checked && el.value === 'ITA') {
      $(el).closest('li').find('.show-checkbox-content').addClass('hide-checkbox-content')
      $(el).closest('li').find('.show-checkbox-content').removeClass('show-checkbox-content')
      $('#inputAssistanceInformation').val('')
    }
    if (!el.checked && el.value === 'QNR') {
      $(el).closest('li').find('.show-checkbox-content').addClass('hide-checkbox-content')
      $(el).closest('li').find('.show-checkbox-content').removeClass('show-checkbox-content')
      $('.question-reader-reason').prop('checked', false)
      questionReaderOtherInformation.val('')
      questionReaderOtherInformation.parents('.panel').addClass('js-hidden')
    }
  })
  $(accessArrangementsList).find('input:radio').change(function (i) {
    var el = i.currentTarget
    if (el.checked && el.value === 'OTH') {
      $($(el).parent().siblings('.panel')).removeClass('js-hidden')
    }
    if (el.checked && el.value !== 'OTH') {
      $($(el).parent().siblings('.panel')).addClass('js-hidden')
      questionReaderOtherInformation.val('')
    }
  })
})
