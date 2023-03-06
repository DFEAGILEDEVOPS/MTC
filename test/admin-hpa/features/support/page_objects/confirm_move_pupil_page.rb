class ConfirmMovePupilPage < SitePrism::Page
  set_url '/service-manager/pupil/move/{id}'

  element :heading, '.govuk-heading-xl'
  element :pupil_name, 'div.govuk-grid-column-two-thirds h2.govuk-heading-m'

  element :moving_pupil_text, 'form p:nth-of-type(1)'
  element :from_school_text, 'form p:nth-of-type(2)'
  element :to_school_text, 'form p:nth-of-type(3)'

  element :confirm_move_pupil, '#searchh-btn'
  element :cancel, '.govuk-button', text: 'Cancel'

end
