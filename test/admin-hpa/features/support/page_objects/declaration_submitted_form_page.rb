class DeclarationSubmittedFormPage < SitePrism::Page
  set_url '/attendance/submitted-form'
  element :heading, '.govuk-heading-xl', text: "View submission"
  element :details_confirmed_list, ".govuk-list--bullet"
  element :warning_notconfirmed_panel, 'div[class="govuk-inset-text"]'
end
