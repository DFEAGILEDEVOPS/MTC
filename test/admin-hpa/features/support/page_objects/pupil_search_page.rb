class PupilSearchPage < SitePrism::Page
  set_url '/service-manager/pupil-search'

  element :heading, '.govuk-heading-xl', text: 'Pupil Search'
  element :upn, '#q'
  element :search, '#search-btn'
  element :cancel, 'a', text: 'Cancel'
  element :no_pupils_found, 'a', text: 'No pupil found'


  section :pupil_results, '.govuk-spacious' do
    sections :pupil_row, 'tbody tr' do
      element :name, 'td:nth-child(1)'
      element :dob, 'td:nth-child(2)'
      element :school, 'td:nth-child(3)'
      element :urn, 'td:nth-child(4)'
      element :dfe_number, 'td:nth-child(5)'
    end
  end


end
