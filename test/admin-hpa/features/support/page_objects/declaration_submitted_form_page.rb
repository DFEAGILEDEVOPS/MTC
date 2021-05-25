class DeclarationSubmittedFormPage < SitePrism::Page
  set_url '/attendance/submitted-form'
  element :heading, '.govuk-heading-xl', text: "View submission"
  element :details_confirmed_list, ".govuk-list--bullet"
  element :details_not_confirmed, 'p', text: 'I am unable to confirm the statements above'
end
