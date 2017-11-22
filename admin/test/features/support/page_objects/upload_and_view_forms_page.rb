class UploadAndViewFormsPage < SitePrism::Page
  set_url '/test-developer/upload-and-view-forms'

  element :heading, '.heading-xlarge', text: 'Upload and view forms'
  element :new_form_heading, '.heading-xlarge', text: 'Upload new form'
  elements :new_form_sub_heading, '.heading-medium'

  elements :new_form_info_message, '.numeric-list li'
  element :download_form_example_template, '.numeric-list a', text: 'Download the example'
  element :chose_file, '#file-upload'
  element :save, 'input[value="Upload"]'
  element :back, 'a.button-secondary'

  element :upload_form_message, '#lead-paragraph'
  element :upload_new_form, 'a', text: 'Upload new form'
  section :phase_banner, PhaseBanner, '.phase-banner'

  section :available_checks, '#checkFormsList' do
    sections :rows, 'tbody tr' do
      element :title, 'td:nth-of-type(1) a'
      element :assigned_to, 'td:nth-of-type(2)'
      element :uploaded_date, 'td:nth-of-type(3)'
      element :remove_form, 'a', text: 'Remove'
    end
  end

end