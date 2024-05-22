class PupilSearchPage < SitePrism::Page
  set_url '/service-manager/pupil-search'

  element :heading, '.govuk-heading-xl', text: 'Pupil Search'
  element :upn, '#q'
  element :search, '#search-btn'
  element :cancel, 'a', text: 'Cancel'
  element :no_pupils_found, 'a', text: 'No pupil found'


  section :pupil_results, '.govuk-spacious' do
    sections :pupil_row, 'tbody tr' do
      element :created_at, 'td:nth-child(1)'
      element :name, 'td a'
      element :dob, 'td:nth-child(3)'
      element :school, 'td:nth-child(4)'
      element :urn, 'td:nth-child(5)'
      element :dfe_number, 'td:nth-child(6)'
    end
  end


end
