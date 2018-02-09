class GroupFilter < SitePrism::Section

  element :closed_filter, '.filter-label.hidden', text: 'Filter by groups'
  element :opened_filter, '.filter-label', text: 'Filter by groups'
  sections :groups, '#filterByGroup li' do
    element :checkbox, '.pupils-not-taking-the-check'
    element :name, '.font-xsmall'
    element :count, '.group-count'
  end

end