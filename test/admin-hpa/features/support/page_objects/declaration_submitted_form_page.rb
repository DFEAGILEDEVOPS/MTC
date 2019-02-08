class DeclarationSubmittedFormPage < SitePrism::Page
  set_url '/attendance/submitted-form'
  element :heading, '.heading-xlarge', text: "View submission"
  element :details_confirmed_list, 'ul[class="list list-bullet"]'
  element :warning_notconfirmed_panel, 'div[class="panel panel-border-wide"]'
end
