class PupilRegisterPage < SitePrism::Page
  set_url '/school/pupil-register/lastName/true'

  element :heading, '.heading-xlarge', text: 'Pupil Register'
  element :add_pupil, 'a[href="/school/pupil/add"]'
  section :phase_banner, PhaseBanner, '.phase-banner'

  section :pupil_list_column_heading, '#register-pupils thead tr' do
    element :name_heading, 'th:nth-child(1)'
    element :group_heading, 'th:nth-child(2)'
    element :result_heading, 'th:nth-child(3)'
  end

  section :pupil_list, '#register-pupils' do
    sections :pupil_row, 'tbody tr' do
      element :names, 'td:nth-child(1)'
      element :group, 'td:nth-child(2)'
      element :result, 'td:nth-child(3)'
      element :edit_pupil_link, 'a'
    end
  end

  def find_pupil_row(name)
    wait_until{!(pupil_list.pupil_row.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.pupil_row.find {|pupil| pupil.text.include? name}
  end


end