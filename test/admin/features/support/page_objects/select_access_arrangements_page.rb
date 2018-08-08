class SelectAccessArrangementsPage < SitePrism::Page
  set_url '/access-arrangements/select-access-arrangements?'

  element :heading, '.heading-xlarge', text: 'Select access arrangement for pupil'
  element :search_pupil, '#pupil-name'
  element :drop_down, '#details-content-0'
  element :save, '#save-access-arrangement'
  element :cancel, 'a[href="/access-arrangements/overview"]'
  element :back_to_top, 'a[href="#top"]'
  section :access_arrangements, '#accessArrangementsList' do
    sections :row, 'tr' do
      element :arrangement_name, 'label'
      element :checkbox, '.multiple-choice-mtc'
    end
  end

end