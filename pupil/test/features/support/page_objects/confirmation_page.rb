class ConfirmationPage < SitePrism::Page
  set_url '/check/sign-in-success'

  element :heading, '.heading-xlarge'
  element :page_instructions, '.lede', text: 'Check your details below. Begin the multiplication tables check by clicking on ‘Read instructions’.'
  element :first_name, "#first-name"
  element :last_name, "#last-name"
  element :school_name, "#school"
  element :back_sign_in_page, "a[href='/sign-out']"
  element :read_instructions,"input[value='Read Instructions']"
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'
end
