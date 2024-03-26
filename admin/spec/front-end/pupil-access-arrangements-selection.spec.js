'use strict'

/* global $ describe it expect beforeEach */

function initAAElements () {
  const $accessArrangementsList = $('<ul class="checkbox-list" id="accessArrangementsList" role="listbox" aria-label="Select access arrangement(s)"></ul>')
  const accessArrangements = [
    {
      title: 'Audible time alert',
      code: 'ATA'
    },
    {
      title: 'Colour contrast',
      code: 'CCT'
    },
    {
      title: 'Font size',
      code: 'FTS'
    },
    {
      title: 'Input assistance (reason required)',
      code: 'ITA'
    },
    {
      title: '\'Next\' button between questions',
      code: 'NBQ'
    },
    {
      title: 'Question reader (reason required)',
      code: 'QNR'
    },
    {
      title: 'Remove on-screen number pad',
      code: 'RON'
    }
  ]

  const questionReaderReasons = [
    {
      title: 'English as an additional language (EAL)',
      code: 'EAL'
    },
    {
      title: 'Slow processing',
      code: 'SLP'
    },
    {
      title: 'Visual impairments',
      code: 'VIM'
    },
    {
      title: 'Other',
      code: 'OTH'
    }
  ]

  const $inputAssistanceTextArea = `<div class="hide-checkbox-content">
            <br>
            <div class="notice">
                <i class="icon icon-important small">
                    <span class="visually-hidden">Warning</span>
                </i>
                <strong class="bold-xsmall">
                    Name of input assistant will need to be provided during the pupil\\'s check'
                </strong>
            </div>
        </div>`

  const $questionReaderOtherTextArea = `<div class="govuk-inset-text govuk-visually-hidden">
              <div class="form-group">
                <div class="form-label">Please explain why the pupil needs this arrangement</div>
                    <textarea id="questionReaderOtherInformation" name="questionReaderOtherInformation"
                                    class="form-control form-control-3-4 restart-reason-info" rows="3"
                                    maxlength="1000"></textarea>
                      </div>
                  </div>`

  const $questionReaderReasons =
    `<div class="hide-checkbox-content">
      <div class="form-group">${questionReaderReasons.map(function (qrr, i) {
    return `<div class="multiple-choice">
      <input id="questionReaderReason-${i}" type="radio" name="questionReaderReason"
      class="question-reader-reason" value="${qrr.code}">
        <label for="questionReaderReason-${i}">${qrr.title}</label>
      </div>
        ${qrr.code === 'OTH' ? $questionReaderOtherTextArea : ''}`
  }
  )}
    </div>
  </div>`

  const $accessArrangementsListItems = accessArrangements.map(function (aa, i) {
    return `<li>
            <div class="font-small">
                <label for="accessArrangement-${i}">
                    ${aa.title}
                </label>
            </div>
            <div class="multiple-choice-mtc">
                <input id="accessArrangement-${i}" name="accessArrangement[${i}]" type="checkbox" value="${aa.code}"
                       aria-label="Tick accessArrangement ${aa.title}." aria-checked="false" role="checkbox">
                <div></div>
            </div>
            ${aa.code === 'ITA' ? $inputAssistanceTextArea : ''}
            ${aa.code === 'QNR' ? $questionReaderReasons : ''}
        </li>`
  })
  $accessArrangementsList.append($accessArrangementsListItems)
  $(document.body).append($accessArrangementsList)
  const $formButtons = `<div class="form-buttons">
    <input type="submit" id="save-access-arrangement" class="button" value="Save" />
    <a href="/access-arrangements/overview" class="button button-secondary">Cancel</a>
    </div>
  `
  const $modalBox = `<div class="modal-overlay" id="js-modal-overlay"></div>
    <dialog class="modal-box" id="js-modal-box" role="dialog" aria-labelledby="modal-title" tabindex="-1">
        <div role="document">
            <h1 id="modal-title"></h1>
            <div class="modal-content">
                <p>
                <div class="modal-buttons">
                    <span class="modal-confirm">
                        <a href="" class="button-secondary" id="js-modal-confirmation-button" title=""></a>
                    </span>
                    <span class="modal-cancel">
                        <a href="" class="button-secondary" id="js-modal-cancel-button" data-focus-back="js-modal-link" title=""></a>
                    </span>
                </div>
            </div>
        </div>
    </dialog>
  `
  const $editViewInput = '<input type="hidden" id="isEditView" name="isEditView" value="true" />'
  $(document.body).append($formButtons)
  $(document.body).append($modalBox)
  $(document.body).append($editViewInput)
}

describe('pupil-access-arrangements-selection', function () {
  describe('after page load', function () {
    beforeEach(function () {
      $('body').empty()
      initAAElements()
      window.MTCAdmin.accessArrangements()
    })

    it('should find hide-checkbox-content class and change it to show-checkbox-content once the checkbox is checked', function () {
      const el = $('.checkbox-list').find('input:checkbox')[3]
      el.checked = false
      expect($($(el).closest('li').find('.hide-checkbox-content')[0]).length).toBe(1)
      $(el).trigger('click')
      expect($($(el).closest('li').find('.show-checkbox-content')[0]).length).toBe(1)
    })

    it('should remove govuk-visually-hidden class to reveal textarea once the last radio button is checked', function () {
      const el = $('.checkbox-list').find('input:checkbox')[5]
      $(el).trigger('click')
      const otherRadioButton = $($($(el).closest('li')).children()[2]).find('input:radio')[3]
      expect($(otherRadioButton).parent().siblings('.govuk-inset-text').hasClass('govuk-visually-hidden')).toBeTruthy()
      $(otherRadioButton).trigger('click')
      expect($(otherRadioButton).parent().siblings('.govuk-inset-text').hasClass('govuk-visually-hidden')).toBeFalsy()
      $(otherRadioButton).trigger('click')
      $(el).trigger('click')
    })

    it('should clear the text input once the checkbox is unchecked', function () {
      const el = $('.checkbox-list').find('input:checkbox')[3]
      const el2 = $('.checkbox-list').find('input:checkbox')[5]
      $(el).trigger('click')
      $(el2).trigger('click')
      const textArea1 = $($(el).closest('li').find('textarea')[0])
      const textArea2 = $($(el2).closest('li').find('textarea')[0])
      textArea1.val('text1')
      textArea2.val('text2')
      $(el).trigger('click')
      $(el2).trigger('click')
      expect(textArea2.val()).toBe('')
      expect(textArea2.val()).toBe('')
    })

    it('it should show the modal when the user submits with no checkboxes are checked', function () {
      const el = $('#save-access-arrangement')
      $(el).trigger('click')
      expect($('#js-modal-box')[0].classList[1]).toBe('show')
    })
  })

  it('it should add show-checkbox-content if relevant checkbox is checked on page load', function () {
    initAAElements()
    const el = $('.checkbox-list').find('input:checkbox')[3]
    el.checked = true
    // Fire method as if page reload occurred
    window.MTCAdmin.accessArrangements()
    expect($(el).closest('li').find('.show-checkbox-content').length).toBe(1)
    expect($(el).closest('li').find('.hide-checkbox-content').length).toBe(0)
    el.checked = false
  })
})
