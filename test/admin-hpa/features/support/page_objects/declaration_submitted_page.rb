class DeclarationSubmittedPage < SitePrism::Page
  set_url '/attendance/submitted'
  element :heading, '.heading-xlarge', text: "Headteacher's declaration form submitted"
  element :link_to_form, "a[href='/attendance/submitted-form']"
  element :message, 'p'
  element :view_results, "a[href='/attendance/view-results']"
end
