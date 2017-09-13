class UnauthorizedPage < SitePrism::Page
  set_url '/unauthorised'

  element :heading, '.heading-xlarge', text: 'Access unauthorised'
  element :info_text, 'p.lede', text: "You're not authorised to access this page."
  element :back_to_home, '.column-two-thirds a[href="/"]'

end
