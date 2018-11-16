class SignInFailurePage < SitePrism::Page
  set_url '/sign-in-failure'

  element :heading, '.heading-xlarge', text: 'Unable to confirm details'
  element :instructions, 'p.lede', text: 'The details entered do not match our records.'
  element :sign_in, 'a[href="/sign-in"]'
  section :phase_banner, PhaseBanner, '.phase-banner'

end
