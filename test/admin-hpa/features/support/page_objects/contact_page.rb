class ContactPage < SitePrism::Page
  set_url '/contact'

  element :heading, '.heading-xlarge'
  element :contact_information, '.panel-border-wide', text: "Multiplication tables check helpline 0345 278 8080"

end
