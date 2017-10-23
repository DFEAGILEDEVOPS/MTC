class GeneratePupilPinsPage < SitePrism::Page
  set_url '/school/generate-pins-overview'

  element :heading, '.heading-xlarge'
  element :generate_pin_message, '.column-two-thirds', text: 'Pupils will need a Personal Identification Number (PIN) and school password in order to start the check. These expire daily.'
  elements :info_message, '.list-number li'
  element :generate_pin_btn, 'input[value="Generate PINs"]'


end