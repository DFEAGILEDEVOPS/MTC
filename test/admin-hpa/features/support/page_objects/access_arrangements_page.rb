class AccessArrangementsPage < SitePrism::Page
  set_url '/access-arrangements/overview'

  element :heading, '.heading-xlarge', text: 'Access arrangements'
  element :information, '.lede', text: 'Modify multiplication tables check for pupils with specific needs. Modifications should be previewed in the pupil’s familiarisation check.'
  element :select_pupil_and_arrangement_btn, 'input[value="Select pupil and arrangement"]'

  element :success_message, '.info-message'
  element :no_pupils_message, '.column-two-thirds', text: 'No pupils with access arrangements or modifications selected.'
  section :pupil_list, '#submitted-pupil-access-arrangements' do
    elements :coloumns, 'tr th'
    sections :rows, 'tbody tr' do
      element :highlighted_pupil, '.green-panel'
      element :pupil_name, 'td:nth-of-type(1) a'
      elements :access_arrangement_name, '.access-arrangements-list div'
      element :remove, 'td:nth-of-type(3) a'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '.modal-cancel'
    element :confirm, '.modal-confirm'

  end

  def remove_all_pupils
    pupil_list.rows.each.size.times {|a| pupil_list.rows.first.remove.click; modal.confirm.click } unless has_no_pupils_message?
  end

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil_name| pupil_name.text.include? name}).nil?}
    pupil_list.rows.find {|pupil_name| pupil_name.text.include? name}
  end

end