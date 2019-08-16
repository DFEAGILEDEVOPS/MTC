class AccessArrangementsPage < SitePrism::Page
  set_url '/access-arrangements/overview'

  element :heading, '.govuk-heading-xl', text: 'Access arrangements'
  element :information, '.govuk-body', text: "Modify the multiplication tables check for pupils with specific needs. The arrangements that are applied can be practised and configured by the pupils when the 'Try it out' area opens"
  element :select_pupil_and_arrangement_btn, 'a[href="/access-arrangements/select-access-arrangements"]'

  element :success_message, '.govuk-info-message'
  element :no_pupils_message, '.govuk-body', text: 'No pupils with access arrangements or modifications selected.'
  section :pupil_list, '#submitted-pupil-access-arrangements' do
    elements :coloumns, 'tr th'
    sections :rows, 'tbody tr' do
      element :highlighted_pupil, '.govuk-highlight-item'
      element :pupil_name, 'a.name-text-wrap'
      elements :access_arrangement_name, '.access-arrangements-list div'
      element :remove, 'td:nth-of-type(3) a'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :contents, '.modal-content p'
    element :cancel, '#js-modal-cancel-button'
    element :confirm, '#js-modal-confirmation-button'

  end

  def remove_all_pupils
    pupil_list.rows.each.size.times {|a| pupil_list.rows.first.remove.click; modal.confirm.click } unless has_no_pupils_message?
  end

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil_name| pupil_name.text.include? name}).nil?}
    pupil_list.rows.find {|pupil_name| pupil_name.text.include? name}
  end

end
