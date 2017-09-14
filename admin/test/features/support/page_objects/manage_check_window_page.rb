class ManageCheckWindowPage < SitePrism::Page
  set_url '/choose-check-window'

  element :heading, '.heading-xlarge', text: 'Manage check windows'
  element :page_instructions, '.lede', text: 'Create, edit or remove check windows. Test development will be responsible for assigning check forms to the check windows created here.'
  element :create_new_window, 'input[value="Create new check window"]'
  element :panel, '.panel-border-wide', text: "Check will be available for schools on weekdays from 8am to 3:30pm"
  element :guidance, "h3 + .list li a[href='/PDFs/MTC_administration_guidance_June-2017-trial.pdf']", text: 'Guidance'
  element :adjust_timings, "h3 + .list li a", text: 'Adjust questions timings'
  element :progress_report, "h3 + .list li a", text: 'Progress report'

  section :windows_table, '#checkWindowList' do
    elements :coloumns, 'tr th'
    sections :rows, 'tbody tr' do
      elements :values, 'td'
    end
  end


end
