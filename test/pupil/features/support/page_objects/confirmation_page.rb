class ConfirmationPage < SitePrism::Page
  set_url '/sign-in-success'

  element :heading, '.heading-xlarge'
  element :page_instructions, '.lede', text: 'If this is you, please confirm.'
  element :first_name, "#first-name"
  element :last_name, "#last-name"
  element :school_name, "#school"
  element :dob, "#dob"
  element :come_back_message, ".bold-small", text: 'After you confirm, you cannot come back to this page'
  element :back_sign_in_page, "a[href='/sign-out']"
  element :read_instructions,"button", text: 'Confirm'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'
end
