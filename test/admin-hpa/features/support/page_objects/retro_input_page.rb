class RetroInputPage < SitePrism::Page
  set_url '/access-arrangements/retro-add-input-assistant'

  element :heading, '.heading-xlarge', text: "Record input assistant used for official check"
  element :search_pupil, '#pupil-autocomplete-container'
  elements :auto_search_list, '#pupil-autocomplete-container__listbox li'
  element :first_name, "#input-assistant-firstname"
  element :last_name, "#input-assistant-lastname"
  element :reason, "#input-assistant-reason"
  element :save, '#save-input-assistant'
  element :cancel, 'a[href="/access-arrangements/select-access-arrangements"]', text: 'Cancel'
  elements :error_summary,'.govuk-error-summary__list li'


  def enter_input_assistant_details
    first_name.set 'Input'
    last_name.set 'Assistant'
    reason.set 'Input Assistant Reason'
  end

end
