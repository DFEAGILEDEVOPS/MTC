class ContactPage < SitePrism::Page
  set_url '/contact'

  element :heading, '.heading-xlarge'
  element :contact_information, '.panel-border-wide', text: "National curriculum assessments helpline 0300 303 3013"

end
