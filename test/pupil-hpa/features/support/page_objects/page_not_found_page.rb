class PageNotFoundPage < SitePrism::Page

  element :heading, '.heading-xlarge', text: 'Page Not Found'
  element :page_not_found_message, 'p', text: 'The requested page could not be found.'
  element :try_again_message, 'p', text: 'Please check and try again, or go to the MTC Homepage'
  element :homepage_link, 'p a', text: 'MTC Homepage'
  element :related_homepage_link, 'li a', text: 'MTC Homepage'

end
