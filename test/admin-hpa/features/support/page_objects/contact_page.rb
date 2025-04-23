class ContactPage < SitePrism::Page
  set_url '/contact'

  element :heading, '.govuk-heading-xl', text:'Contact'
  element :MTC_help_centre, '.govuk-link', text:'MTC help centre'
  element :virtual_assistant, '.govuk-link', text: 'virtual assistant'
  element :contact_us, '.govuk-link', text: 'contact us'
end
