class ManageCheckWindowPage < SitePrism::Page
  set_url '/administrator/check-windows'

  element :heading, '.heading-xlarge', text: 'Manage check windows'
  element :page_instructions, '.lede', text: 'Create, edit or remove check windows. Test development will be responsible for assigning check forms to the check windows created here.'
  element :create_new_window, 'a[href="/administrator/check-windows/add"]'
  element :panel, '.panel-border-wide', text: 'Check will be available for schools on weekdays from 8am to 3:30pm'
  element :guidance, 'aside.support-column nav li a[href="/PDFs/MTC_administration_guidance_June-2017-trial.pdf"]', text: 'Guidance'
  element :adjust_timings, 'aside.support-column nav li a', text: 'Adjust questions timings'
  element :progress_report, 'aside.support-column nav li a', text: 'Progress report'
  element :info_message, '.info-message', text: 'Changes have been saved'

  section :windows_table, '#checkWindowList' do
    elements :coloumns, 'tr th'
    sections :rows, 'tbody tr' do
      elements :values, 'td'
      element :check_window, 'td:nth-child(1)'
    end
  end


  def find_check_row(check_name)
    wait_until{!(windows_table.rows.find {|chk| chk.text.include? check_name}).nil?}
    windows_table.rows.find {|chk| chk.text.include? check_name}
  end


end
