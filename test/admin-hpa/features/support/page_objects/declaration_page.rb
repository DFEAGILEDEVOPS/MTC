class DeclarationPage < SitePrism::Page
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge', text: "Headteacher's declaration form"
  element :confirm_hdf, '.multiple-choice #confirm'
  element :decline_hdf, '.multiple-choice #decline'
  element :job_title, '#jobTitle'
  element :job_title, '#jobTitle'


  section :pupil_list, '#attendanceList tbody' do
    sections :rows, 'tr' do
      element :name, '.highlight-wrapper'
      element :reason, 'td:nth-of-type(2)'
      element :link, 'a'
    end
  end


  def select_pupil(name)
    row = pupil_list.rows.find {|row| row.name.text.include? name}
    row.link.click
  end

  def get_pupil_reason(name)
    row = pupil_list.rows.find {|row| row.name.text.include? name}
    row.reason.text
  end

end
