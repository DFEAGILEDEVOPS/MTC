class UnauthorizedPage < SitePrism::Page
  set_url '/unauthorised'

  element :heading, '.govuk-heading-xl', text: 'Access unauthorised'
  element :info_text, 'p.govuk-body', text: "You're not authorised to access this page."
  element :back_to_home, '.govuk-link[href="/"]'

end
