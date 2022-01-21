class TioOrLivePinsPage < SitePrism::Page
  set_url '/pupil-pin/select-official-or-try-it-out'

  element :heading, '.govuk-heading-xl'
  element :generate_pin_message, 'p.govuk-body'
  element :access_arrangment_link, "a[href='/access-arrangements/overview']", text: 'access arrangements'
  element :generate_tio_pins, 'a', text: 'Generate Try it out PINs'
  element :generate_live_pins, 'a', text: 'Generate official PINs'


end
