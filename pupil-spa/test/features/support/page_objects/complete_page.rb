class CompletePage < SitePrism::Page
  set_url '/check/complete{?query}'

  element :heading, '.heading-xlarge', text: "Thank you"
  element :completion_text, 'p.text', text: "You have completed the multiplication tables check."
  element :sign_out, 'a[href="/sign-out"]'
  element :feedback, 'p > a[href="/feedback"]'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

end
