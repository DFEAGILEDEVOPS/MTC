class GeneratePupilPinsPage < SitePrism::Page
  set_url '/school/generate-pins-overview'

  element :heading, '.heading-xlarge'
  elements :info_message, '.list-number li'
  element :generate_pin_btn, 'input[value="Generate PINs"]'


end