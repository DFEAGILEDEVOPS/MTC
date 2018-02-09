class GroupFilter < SitePrism::Section

  element :filter_label, '.filter-label', text: 'Filter by groups'
  element :opened_filter, '.filter-label.active', text: 'Filter by groups'
  sections :groups, '#filterByGroup li' do
    element :checkbox, '.pupils-not-taking-the-check'
    element :name, '.font-xsmall'
  end

end