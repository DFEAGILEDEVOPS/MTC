class ManageOrganisationsPage < SitePrism::Page
  set_url '/service-manager/organisations'

  element :heading, '.govuk-heading-xl', text: 'Manage organisations'
  element :search, 'a', text: 'Search for an existing organisation'
  element :upload, 'a', text: 'Upload organisations'
  element :add_school, 'a', text: 'Add a single organisation'
  element :school_added, '.govuk-info-message', text: 'School added'


end
