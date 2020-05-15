class UploadAndViewFormsV2Page < SitePrism::Page
  set_url '/test-developer/view-forms'

  element :heading, '.govuk-heading-xl', text: 'Upload and view forms'
  element :info, '.govuk-body', text: 'Upload, view or remove check forms.'
  element :upload_new_form, 'a[href="/test-developer/upload-new-forms"]'
  element :flash_message, '.govuk-info-message'
  element :confirm_delete, '#js-modal-confirmation-button'
  element :cancel_delete, '#js-modal-cancel-button'

  elements :related, '.govuk-heading-m', text: 'Related'

  section :form_list, '#checkFormsList tbody' do
    sections :rows, 'tr' do
      element :highlighted, '.govuk-highlight-item'
      element :name, 'td:nth-of-type(1) a:last-of-type'
      element :type, 'td:nth-of-type(2)'
      element :uploaded_on, 'td:nth-of-type(3)'
      element :remove, 'td:nth-of-type(4) .modal-link'
    end
  end

end

