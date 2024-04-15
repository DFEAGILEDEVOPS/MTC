module Helpers

  def wait_until(timeout_sec = ENV['WAIT_TIME'].to_i, delay_sec = 0.5, &block)
    WaitUtil.wait_for_condition("waiting for condition", :timeout_sec => timeout_sec, :delay_sec => delay_sec) do
      block.call
    end
  end

  def time_to_nearest_hour(time)
    time - time.sec - 60 * time.min
    return time.strftime("%Y-%m-%d %H")
  end

  def calculate_age(expected_years_old)
    academic_start_date = Time.parse calculate_academic_year
    pupil_dob = academic_start_date - expected_years_old.to_i.years
  end

  def calculate_academic_year
    if Date.parse("1/9/#{Date.today.year}").future?
      academic_year = "1/9/#{(Date.today.year) - 1}"
    else
      academic_year = "1/9/#{Date.today.year}"
    end
    academic_year
  end

  def calculate_ctf_reason_code(reason)
    case reason
    when 'Working below expectation'
      'B'
    when 'Absent during check window'
      'A'
    when 'Just arrived and unable to establish abilities'
      'J'
    when 'Left school'
      'L'
    when 'Unable to access'
      'U'
    when 'Incorrect registration'
      'Z'
    when 'Not taken'
      'X'
    else
      p reason
      fail 'Reason not recognised ' + reason
    end
  end

  def prior_fridays(date, fridays_ago)
    days_before = (date.wday + 1) % 7 + 1
    most_recent = date.to_date - days_before
    diff = (date.mjd - most_recent.mjd)
    case fridays_ago
    when 1
      most_recent
    when 2
      diff < 14 ? most_recent - 14 : most_recent
    else
      fail 'Option not recognised'
    end
  end

  def get_service_bus_queue(name, config_array)
    config_array.select {|config| config['name'] == name}
  end

  def get_expected_config(name)
    default_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT_MEGABYTES'].nil? ? 5120 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT_MEGABYTES']
    ps_schools_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_SCHOOLS'].nil? ? 5120 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_SCHOOLS']
    ps_staging_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_STAGING'].nil? ? 81920 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_STAGING']
    ps_export_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXPORT'].nil? ? 81920 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXPORT']
    case name
    when 'check-completion', 'check-notification', 'check-marking', 'check-notification', 'check-sync', 'check-validation', 'pupil-login', 'queue-replay', 'school-results-cache', 'sync-results-to-db-complete'
      [{"maxSizeInMegabytes" => default_max_size.to_i, "defaultMessageTimeToLive" => "P120D", "lockDuration" => "PT5M", "requiresDuplicateDetection" => true, "deadLetteringOnMessageExpiration" => true, "duplicateDetectionHistoryTimeWindow" => "P1D", "enablePartitioning" => false, "requiresSession" => false, "name" => name}]
    when 'ps-report-schools'
      [{"maxSizeInMegabytes" => ps_schools_max_size.to_i, "defaultMessageTimeToLive" => "P6D", "lockDuration" => "PT5M", "requiresDuplicateDetection" => true, "deadLetteringOnMessageExpiration" => true, "duplicateDetectionHistoryTimeWindow" => "P1D", "enablePartitioning" => false, "requiresSession" => false, "name" => "ps-report-schools"}]
    when 'ps-report-staging'
      [{"maxSizeInMegabytes" => ps_staging_max_size.to_i, "defaultMessageTimeToLive" => "P6D", "lockDuration" => "PT5M", "requiresDuplicateDetection" => true, "deadLetteringOnMessageExpiration" => true, "duplicateDetectionHistoryTimeWindow" => "P1D", "enablePartitioning" => false, "requiresSession" => false, "name" => "ps-report-staging"}]
    when 'ps-report-export'
      [{"maxSizeInMegabytes" => ps_export_max_size.to_i, "defaultMessageTimeToLive" => "P6D", "lockDuration" => "PT5M", "requiresDuplicateDetection" => true, "deadLetteringOnMessageExpiration" => true, "duplicateDetectionHistoryTimeWindow" => "P1D", "enablePartitioning" => false, "requiresSession" => false, "name" => "ps-report-export"}]
    else
      fail 'Name of queue not found'
    end
  end

  def navigate_to_pupil_list_for_pin_gen(check_type)
    school_landing_page.load
    school_landing_page.generate_passwords_and_pins.click
    case check_type
    when 'tio'
      tio_or_live_pins_page.generate_tio_pins.click
      generate_tio_pins_overview_page.generate_pin_btn.click if generate_tio_pins_overview_page.has_generate_pin_btn?
      generate_tio_pins_overview_page.generated_pin_overview.generate_additional_pins_btn.click if generate_tio_pins_overview_page.generated_pin_overview.has_generate_additional_pins_btn?
    when 'live'
      tio_or_live_pins_page.generate_live_pins.click
      generate_live_pins_overview_page.generate_pin_btn.click if generate_live_pins_overview_page.has_generate_pin_btn?
      generate_live_pins_overview_page.generated_pin_overview.generate_additional_pins_btn.click if generate_live_pins_overview_page.generated_pin_overview.has_generate_additional_pins_btn?
    else
      fail 'check type not found'
    end
  end

  def freeze_pupil(upn, school_id)
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
    step 'I have signed in with service-manager'
    admin_page.pupil_search.click
    pupil_search_page.upn.set upn
    pupil_search_page.search.click
    pupil_summary_page.freeze_this_pupil.click
    pupil_annulment_confirmation_page.upn.set upn
    pupil_annulment_confirmation_page.confirm.click
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  end

  def undo_freeze(upn, school_id)
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
    step 'I have signed in with service-manager'
    admin_page.pupil_search.click
    pupil_search_page.upn.set upn
    pupil_search_page.search.click
    pupil_summary_page.thaw_this_pupil.click
    pupil_annulment_confirmation_page.upn.set upn
    pupil_annulment_confirmation_page.confirm.click
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  end


  def annul_pupil(upn, school_id)
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
    step 'I have signed in with service-manager'
    admin_page.pupil_search.click
    pupil_search_page.upn.set upn
    pupil_search_page.search.click
    pupil_summary_page.annul_results.click
    pupil_annulment_confirmation_page.upn.set upn
    pupil_annulment_confirmation_page.confirm.click
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  end

  def undo_annulment(upn, school_id)
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
    step 'I have signed in with service-manager'
    admin_page.pupil_search.click
    pupil_search_page.upn.set upn
    pupil_search_page.search.click
    pupil_summary_page.undo_annulment.click
    pupil_annulment_confirmation_page.upn.set upn
    pupil_annulment_confirmation_page.confirm.click
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  end

  def create_dfe_number
    @lea_code = '999'
    if SqlDbHelper.get_schools_list.map {|school| school['estabCode']}.sort.last == 9999
      estab_counter = 1000
      lea_code_change = true
    else
      estab_counter = SqlDbHelper.get_schools_list.map {|school| school['estabCode']}.sort.last
    end
    @estab_code = estab_counter + 1
    if lea_code_change
      lea_code_list = UpnHelper.collection_of_la_codes
      lea_code_list.delete(SqlDbHelper.get_schools_list.map {|school| school['leaCode']}.sort.last.to_s)
      lea_code_list.delete('201')
      @lea_code =  lea_code_list.sample
    end
    {estab_code: @estab_code, lea_code: @lea_code}
  end

end
