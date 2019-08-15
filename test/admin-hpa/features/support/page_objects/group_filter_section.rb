class GroupFilter < SitePrism::Section

  element :closed_filter, '.filter-content .hidden'
  element :opened_filter, '.filter-content', visible: true
  sections :groups, '#filterByGroup li' do
    element :checkbox, '.pupils-not-taking-the-check'
    element :name, "label[class*='font']"
    element :count, '.group-count'
  end

end
