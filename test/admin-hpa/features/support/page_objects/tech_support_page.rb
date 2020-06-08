class TechSupportPage < SitePrism::Page
  set_url '/tech-support/home'

  element :heading, '.govuk-heading-xl', text: 'Tech Support'
  element :check_view, '.govuk-link', text: 'Check View'


end
