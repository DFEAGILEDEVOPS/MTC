class SelectAccessArrangementsPage < SitePrism::Page
  set_url '/access-arrangements/select-access-arrangements?'

  element :heading, '.heading-xlarge', text: 'Select access arrangement for pupil'
  element :edit_heading, '.heading-xlarge', text: 'Edit access arrangement for pupil'
  element :pupil_name, '.column-two-thirds .panel.panel-border-wide p'
  element :search_pupil, '#pupil-autocomplete-container'
  elements :auto_search_list, '#pupil-autocomplete-container__listbox li'
  element :drop_down, '#details-content-0'
  element :save, '#save-access-arrangement'
  element :cancel, 'a[href="/access-arrangements/overview"]', text: 'Cancel'
  element :back_to_top, 'a[href="#top"]'
  section :access_arrangements, '#accessArrangementsList' do
    sections :row, 'li' do
      element :arrangement_name, '.font-small label'
      element :checkbox, '.multiple-choice-mtc'
      sections :question_reader_reason, '.show-checkbox-content .multiple-choice' do
        element :question_reader_reason_radio , 'input'
        element :question_reader_reason_name , 'label'
      end
    end
  end
  element :confirm_removal, '#js-modal-confirmation-button'
  element :cancel_removal, '#js-modal-cancel-button'

  element :input_assistance_info, '.show-checkbox-content .form-label'
  element :input_assistance_reason, '#inputAssistanceInformation'
  element :input_assistance_notice, '.notice'

  section :error_summary, 'div[aria-labelledby="error-summary-heading-1"]' do
    element :error_heading, '#error-summary-heading-1', text: 'You need to fix the errors on this page before continuing'
    element :error_info, 'p', text: 'See highlighted errors below'
    element :error_text, 'ul li a'
  end

  def select_access_arrangement(access_arrangment_name)
    access_arrangment_type = find_access_arrangement_row(access_arrangment_name)
    access_arrangment_type.checkbox.click
  end

  def find_access_arrangement_row(name)
    wait_until {!(access_arrangements.row.find {|access_arrang_type| access_arrang_type.text.include? name}).nil?}
    access_arrangements.row.find {|access_arrang_type| access_arrang_type.text.include? name}
  end

end