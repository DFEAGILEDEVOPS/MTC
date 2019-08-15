class SelectAccessArrangementsPage < SitePrism::Page
  set_url '/access-arrangements/select-access-arrangements?'

  element :heading, '.govuk-heading-xl', text: 'Select access arrangement for pupil'
  element :edit_heading, '.heading-xlarge', text: 'Edit access arrangement for pupil'
  element :pupil_name, '.govuk-grid-column-two-thirds .govuk-inset-text p'
  element :search_pupil, '#pupil-autocomplete-container'
  elements :auto_search_list, '#pupil-autocomplete-container__listbox li'
  element :drop_down, '.govuk-details__text'
  element :save, '#save-access-arrangement'
  element :cancel, 'a[href="/access-arrangements/overview"]', text: 'Cancel'
  element :back_to_top, 'a[href="#top"]'
  section :access_arrangements, '#accessArrangementsList' do
    sections :row, 'li' do
      element :arrangement_name, 'div[class="govuk-!-font-size-16"] .govuk-label'
      element :checkbox, '.multiple-choice-mtc'
      sections :question_reader_reason, '.show-checkbox-content .multiple-choice' do
        element :question_reader_reason_radio , 'input'
        element :question_reader_reason_name , 'label'
      end
    end
  end
  element :confirm_removal, '#js-modal-confirmation-button'
  element :cancel_removal, '#js-modal-cancel-button'

  element :input_assistance_info, '.show-checkbox-content .govuk-label'
  element :input_assistance_reason, '#inputAssistanceInformation'
  element :next_button_reason, '#nextButtonInformation'
  element :input_assistance_notice, '.govuk-warning-text'

  section :error_summary, 'div[aria-labelledby="error-summary-title"]' do
    element :error_heading, '#error-summary-title', text: 'You need to fix the errors on this page before continuing'
    element :error_info, 'p', text: 'See highlighted errors below'
    element :error_text, 'ul li a'
  end

  def select_access_arrangement(access_arrangment_name)
    access_arrangment_type = find_access_arrangement_row(access_arrangment_name)
    access_arrangment_type.checkbox.click
    case access_arrangment_name
      when 'Input assistance'
        input_assistance_reason.set 'A reason for requiring this access arrangement'
      when 'Question reader'
        question_reader = select_access_arrangements_page.find_access_arrangement_row('Question reader')
        question_reader.question_reader_reason[1].question_reader_reason_radio.click
    end
  end

  def find_access_arrangement_row(name)
    wait_until {!(access_arrangements.row.find {|access_arrang_type| access_arrang_type.text.include? name}).nil?}
    access_arrangements.row.find {|access_arrang_type| access_arrang_type.text.include? name}
  end

end
