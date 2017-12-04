class RestartsPage < SitePrism::Page
  set_url '/restart/overview'

  element :heading, '.heading-xlarge'
  element :restarts_message, '.font-medium'
  element :select_pupil_to_restart_btn, 'input[value="Select pupils to restart"]'
  element :reasons_list, '.restart-list'
  element :reason_1, '.restart-list #restart-reason-1'
  element :reason_4, '.restart-list #restart-reason-4'
  element :reason4_explanation_input, '#did-not-complete-textarea'
  element :restart_further_info_input, '#restart-further-textarea'
  element :select_all_pupils, '#tickAllCheckboxes'
  element :deselct_all_pupil, '#tickAllCheckboxes', text: 'Deselect all'
  element :back_to_top, 'a', text: 'Back to top'
  element :flash_message, '.info-message'

  section :pupil_list, '#pupilsRestartList tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :selected, 'input[data-checked="true"]'
      element :name, 'label'
    end
  end

  section :sticky_banner, '.sticky-banner-wrapper' do
    element :count, '.grid-row .column-half.first-half'
    element :cancel, '#stickyCancel'
    element :confirm, '#stickyConfirm'
  end

  section :explanation_section, 'details' do
    element :toggle, 'summary[role="button"]'
    element :loss_of_internet, 'strong', text: 'Loss of internet'
    element :it_issues, 'strong', text: 'IT Issues'
    element :classroom_disruption, 'strong', text: 'Classroom disruption'
    element :did_not_complete, 'strong', text: 'Did not complete'
  end

  section :error_summary, '.error-summary' do
    element :error_heading, '#error-summary-heading-1', text: 'Check the restart form'
    element :error_info, 'p', text: 'You need to fix the errors on this page before continuing. See highlighted errors below'
    element :error_text, 'ul li a', text: 'Please specify further information when "Did not complete" option is selected'
  end

  def restarts_for_pupil(name)
    pupil = find_pupil_row(name)
    name = pupil.name.text
    pupil.checkbox.click
    sticky_banner.confirm.click
    name
  end

  def restarts_for_multiple_pupils(number_of_pupils)
    pupils_with_no_pin = pupil_list.rows.select {|row| row.has_no_selected?}
    pupil_array = pupils_with_no_pin[0..number_of_pupils.to_i]
    pupil_names = pupil_array.map {|pupil| pupil.name.text}
    pupil_array.each {|pupil| pupil.checkbox.click}
    sticky_banner.confirm.click
    pupil_names
  end

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

end