'use strict'
/* global $ spyOn */

function initUploadCheckFormElements () {
  const hasExistingFamiliarisationCheckFormInput = '<input type="hidden" id="hasExistingFamiliarisationCheckForm" name="hasExistingFamiliarisationCheckForm" value="" />'
  const checkFormTypes = [{ value: 'L', name: 'Live' }, { value: 'F', name: 'Familiarisation' }]
  const checkFormTypeInputs = checkFormTypes.map(cft => `
                        <div class="multiple-choice">
                            <input id="checkFormType"
                                   type="radio"
                                   role="radio"
                                   aria-checked="false"
                                   name="checkFormType"
                                   value=${cft.value}
                            />
                            <label for="live-check-form">${cft.name}</label>
                        </div>
  `)

  const htmlForm = `<form action="/test-developer/upload" method="post" enctype="multipart/form-data" id="check-form-upload-form">
            <input type="hidden" name="_csrf" value="<%= csrftoken %>" />
            ${hasExistingFamiliarisationCheckFormInput}
            <div class="form-group">
                <div class="font-xsmall">
                    <input
                      type="file"
                      name="csvFiles"
                      id="csvFiles"
                      accept=".csv"
                      aria-label="Choose a file to upload"
                      multiple
                    />
                </div>
                <input type="reset" class="link remove-file" id="removeUploadedFile" value="Remove files" aria-label="Remove uploaded files." />
            </div>
            <div class="form-group" id="check-form-type">
                <fieldset role="radiogroup">
                    <div class="inline">
                    ${checkFormTypeInputs}
                    </div>
                </fieldset>
            </div>

            <div class="form-buttons">
                <input type="submit" class="button" id="upload-form-submit" value="Upload" />
                <a href="/test-developer/view-forms" class="button button-secondary">Cancel</a>
            </div>
        </form>
  `
  const modalBox = `<div class="modal-overlay" id="js-modal-overlay"></div>
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
  $(document.body).append(htmlForm)
  $(document.body).append(modalBox)
}

describe('check-forms', function () {
  let formSubmitSpy
  const checkFormSubmit = $('#upload-form-submit')
  beforeEach(() => {
    $('body').empty()
    initUploadCheckFormElements()
    window.MTCAdmin.checkForms()
    formSubmitSpy = spyOn($.fn, 'submit')
    spyOn(checkFormSubmit, 'click').and.returnValue(false)
  })
  it('should display modal when existing familiarisation form exists and new familiarisation form is pending submission', function () {
    $('#hasExistingFamiliarisationCheckForm').val('true')
    const familiarisationRadioButton = $('#check-form-type').find(':input[value="F"]')
    familiarisationRadioButton.attr('checked', true)
    const checkFormSubmit = $('#upload-form-submit')
    checkFormSubmit.trigger('click')
    expect($('#js-modal-box')[0].classList[1]).toBe('show')
    expect(formSubmitSpy).not.toHaveBeenCalled()
  })
  it('should not display modal when existing familiarisation form does not exists', function () {
    $('#hasExistingFamiliarisationCheckForm').val('false')
    const familiarisationRadioButton = $('#check-form-type').find(':input[value="F"]')
    familiarisationRadioButton.attr('checked', true)
    checkFormSubmit.trigger('click')
    expect($('#js-modal-box')[0].classList[1]).toBeUndefined()
  })
  it('should not display modal when live check form is being submitted and existing familiarisation form exists', function () {
    $('#hasExistingFamiliarisationCheckForm').val('true')
    const liveRadioButton = $('#check-form-type').find(':input[value="L"]')
    liveRadioButton.attr('checked', true)
    checkFormSubmit.trigger('click')
    expect($('#js-modal-box')[0].classList[1]).toBeUndefined()
  })
  it('should submit form when modal confirm is selected', function () {
    $('#hasExistingFamiliarisationCheckForm').val('true')
    const familiarisationRadioButton = $('#check-form-type').find(':input[value="F"]')
    familiarisationRadioButton.attr('checked', true)
    const checkFormSubmit = $('#upload-form-submit')
    checkFormSubmit.trigger('click')
    $('#js-modal-confirmation-button').trigger('click')
    expect(formSubmitSpy).toHaveBeenCalled()
  })
})
