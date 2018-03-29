class DeclarationCompletePage < SitePrism::Page
  element :heading, '.heading-xlarge', text: "Headteacher's declaration form submitted"
  element :message, '.lede'
  element :message, '.lede + .font-small'
  element :view_results, "[value='View results']"
  element :feedback, "a[href='#']"
end