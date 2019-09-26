class ContactPage < SitePrism::Page
  set_url '/contact'

  element :heading, '.govuk-heading-xl'
  element :contact_information, '.govuk-inset-text', text: "National curriculum assessments helpline 0300 303 3013"

end
