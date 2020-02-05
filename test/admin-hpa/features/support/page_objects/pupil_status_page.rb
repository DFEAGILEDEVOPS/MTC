class PupilStatusPage < SitePrism::Page
  set_url '/pupil-status'

  element :heading, '.heading-xlarge', text: 'Check the progress of the multiplication tables check'
  element :info, '.govuk-body', text: 'This list is taken from your school census data. Review the status of the pupils to ensure the pupils have all successfully completed the check before you sign the HDF'

  section :pupil_list, '#pupil-status' do
    element :table_caption, '.govuk-table__caption'
    sections :pupil_row, 'tbody tr' do
      element :names, 'td:nth-child(1)'
      element :status, 'td:nth-child(2)'
    end
  end

  def find_pupil_row(name)
    wait_until{!(pupil_list.pupil_row.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.pupil_row.find {|pupil| pupil.text.include? name}
  end

end
