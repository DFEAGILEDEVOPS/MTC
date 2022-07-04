class PupilAnnulmentConfirmationPage < SitePrism::Page
  set_url '/service-manager/annul_pupil/{id}'


  element :upn, '#upn'
  element :confirm, '#search-btn'
  element :cancel, '.govuk-button'
end
