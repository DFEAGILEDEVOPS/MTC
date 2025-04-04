'use strict'

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
