class ManageCheckWindowPage < SitePrism::Page
  set_url '/service-manager/check-windows'

  element :heading, '.heading-xlarge', text: 'Manage check windows'
  element :page_instructions, '.lede', text: 'Create, edit or remove check windows. Test development will be responsible for assigning check forms to the check windows created here.'
  element :create_new_window, 'a[href="/service-manager/check-windows/add"]'
  element :panel, '.panel-border-wide', text: 'Check will be available for schools on weekdays from 8am to 3:30pm'
  element :guidance, 'aside.support-column nav li a[href="/pdfs/mtc-administration-guidance-2018-03-1.pdf"]', text: 'Guidance'
  element :adjust_timings, 'aside.support-column nav li a', text: 'Settings on pupil check'
  element :progress_report, '.disabled-link', text: 'View progress report'
  element :info_message, '.info-message', text: 'Changes have been saved'
  element :sort_desc, 'a[href="/service-manager/check-windows/checkWindowName/desc"]'
  element :sort_asc, 'a[href="/service-manager/check-windows/checkWindowName/asc"]'

  section :windows_table, '#checkWindowList' do
    elements :coloumns, 'tr th'
    sections :rows, 'tbody tr' do
      element :check_name, 'td:nth-of-type(1)'
      element :admin_start_date, 'td:nth-of-type(2)'
      element :check_period, 'td:nth-of-type(3)'
      element :remove, 'td:nth-of-type(4)', text: 'Remove'
    end
    sections :expired_rows, 'tbody tr.font-greyed-out' do
      element :check_name, 'td:nth-of-type(1)'
      element :admin_start_date, 'td:nth-of-type(2)'
      element :check_period, 'td:nth-of-type(3)'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '.modal-cancel'
    element :confirm, '.modal-confirm'

  end

  def find_check_row(check_name)
    wait_until {!(windows_table.rows.find {|chk| chk.text.include? check_name}).nil?}
    windows_table.rows.find {|chk| chk.text.include? check_name}
  end

  def find_expired_check_row(check_name)
    wait_until {!(windows_table.rows.find {|chk| chk.text.include? check_name}).nil?}
    windows_table.rows.find {|chk| chk.text.include? check_name}
  end

  def format_admin_date(day, month, year)
    parsed_admin_date = DateTime.parse("#{day} #{month} #{year}")
    parsed_admin_date.strftime("%-d %b %Y")
  end

  def format_check_period(start_day, start_month, start_year, end_day, end_month, end_year)
    parsed_check_start = DateTime.parse("#{start_day} #{start_month} #{start_year}")
    formatted_start_date = start_year == end_year ? parsed_check_start.strftime("%-d %b") : parsed_check_start.strftime("%-d %b %Y")
    parsed_check_end = DateTime.parse("#{end_day} #{end_month} #{end_year}")
    formatted_end_date = parsed_check_end.strftime("%-d %b %Y")
    formatted_start_date + " to " + formatted_end_date
  end


end
