class GeneratedPinsPage < SitePrism::Page
  set_url '/pupil-pin/generated-pins-list'

  element :generate_more_pin_btn, 'a', text: "Generate more PINs"
  element :school_password, '#school-pin'
  element :school_password_info, '.govuk-box-highlight'
  element :download_pin_link, '.column-two-thirds a', text: 'Print pupil PINs and school password'
  element :custom_download_link, '.column-two-thirds a', text: 'Create custom download'

end