class SearchOrganisationsPage < SitePrism::Page
  set_url '/service-manager/organisations/search'

  element :heading, '.govuk-heading-xl', text: 'Search organisations'
  element :input, '#q'
  element :search, '#searchh-btn'
  element :cancel, 'a', text: 'Cancel'
  element :school_not_found, 'a', text: 'No school found'

end
