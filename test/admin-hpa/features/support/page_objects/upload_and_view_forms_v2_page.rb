class UploadAndViewFormsV2Page < SitePrism::Page
  set_url '/check-form/view-forms'

  element :heading, '.heading-xlarge', text: 'Upload and view forms'
  element :info, '#lead-paragraph', text: 'Upload, view or remove check forms.'
  element :upload_new_form, 'a[href="/check-form/upload-new-forms"]'

  elements :related, '.heading-medium', text: 'Related'

end

