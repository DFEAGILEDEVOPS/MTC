class ManageOrganisationsPage < SitePrism::Page
  set_url '/service-manager/organisations'

  element :heading, '.govuk-heading-xl', text: 'Manage organisations'
  element :search, 'a', text: 'Search for an existing organisation'

end
