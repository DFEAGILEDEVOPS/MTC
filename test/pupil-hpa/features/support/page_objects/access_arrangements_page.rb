class AccessArrangementsPage < SitePrism::Page
  set_url '/access-arrangements/overview'

  element :heading, '.govuk-heading-xl', text: 'Enable access arrangements for pupils who need them'
  element :information, '.govuk-body', text: "Access arrangements may be appropriate for pupils with specific needs who require additional arrangements so they can take part in the check. Support given should be based on normal classroom practice and should never advantage or disadvantage pupils."
  element :select_pupil_and_arrangement_btn, 'a[href="/access-arrangements/select-access-arrangements"]'

  element :success_message, '.govuk-info-message'
  element :no_pupils_message, '.govuk-body', text: 'No pupils with access arrangements or modifications selected.'
  section :pupil_list, '#submitted-pupil-access-arrangements' do
    elements :coloumns, 'tr th'
    sections :rows, 'tbody tr' do
      element :highlighted_pupil, '.govuk-highlight-item'
      element :pupil_name, 'a.name-text-wrap'
      elements :access_arrangement_name, '.access-arrangements-list div'
      element :edit, 'td:nth-of-type(3) a'
    end
  end

  section :retro_input, '#retroAddInputAssistantInfo' do
    element :link, "a[href='/access-arrangements/retro-add-input-assistant']"
  end

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil_name| pupil_name.text.include? name}).nil?}
    pupil_list.rows.find {|pupil_name| pupil_name.text.include? name}
  end

end
