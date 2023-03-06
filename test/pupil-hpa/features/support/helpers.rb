module Helpers

  def wait_until(timeout_sec=5,delay_sec=0.5, &block)
    WaitUtil.wait_for_condition("waiting for condition", :timeout_sec => timeout_sec, :delay_sec => delay_sec) do
      block.call
    end
  end

  def create_question_strings(questions)
    array_of_question_strings = []
    questions.each do |question|
      array_of_question_strings << question['factor1'].to_s + ' × ' + question['factor2'].to_s + ' ='
    end
    array_of_question_strings
  end

  def check_device_information(device_info)
    device_info['battery'].nil? ? (p "Battery information not available with current driver: #{Capybara.current_driver}") : (expect(device_info['battery'].keys).to eql ["isCharging", "levelPercent", "chargingTime", "dischargingTime"])
    device_info['cpu'].nil? ? (p "CPU information not available with current driver: #{Capybara.current_driver}") : (expect(device_info['cpu'].keys).to eql ["hardwareConcurrency"])
    device_info['navigator'].nil? ? (p "Navigator information not available with current driver: #{Capybara.current_driver}") : (expect(device_info['navigator'].keys).to eql ["userAgent", "platform", "language", "cookieEnabled", "doNotTrack"])
    device_info['networkConnection'].nil? ? (p "Network connection information not available with current driver: #{Capybara.current_driver}") :  (expect(device_info['networkConnection'].keys).to eql ["downlink", "effectiveType", "rtt"])
    device_info['screen'].nil? ? (p "Screen information not available with current driver: #{Capybara.current_driver}") : (expect(device_info['screen'].keys).to eql ["screenWidth", "screenHeight", "outerWidth", "outerHeight", "innerWidth", "innerHeight", "colorDepth", "orientation"])
  end

  def create_pupil_details_hash(pupil_details)
    {'firstName' => pupil_details['foreName'], 'lastName' => pupil_details['lastName'],
     'dob' => pupil_details['dateOfBirth'].strftime("%-d %B %Y"),
     'checkCode' => SqlDbHelper.get_check_using_pupil(pupil_details['id'])['checkCode'],
     'uuid' => pupil_details['urlSlug']
    }
  end

  def create_school_details_hash(school_id)
    {"name"=>SqlDbHelper.find_school(school_id)['name'], "uuid"=>SqlDbHelper.find_school(school_id)['urlSlug']}
  end

  def create_config_details_hash
    {"questionTime"=>SqlDbHelper.get_settings['questionTimeLimit'].to_i, "loadingTime"=>SqlDbHelper.get_settings['loadingTimeLimit'].to_i, "checkTime"=>SqlDbHelper.get_settings['checkTimeLimit'].to_i, "audibleSounds"=>false, "inputAssistance"=>false, "numpadRemoval"=>false, "fontSize"=>false, "colourContrast"=>false, "questionReader"=>false, "nextBetweenQuestions"=>false, "practice"=>false}
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

  def calculate_aa_id(access_arrangement_array)
    code_array = []
    access_arrangement_array.each do |access_arrangement|
      case access_arrangement
      when 'audibleSounds'
       code_array << '[1]'
      when 'colourContrast'
        code_array << '[2]'
      when 'fontSize'
        code_array << '[3]'
      when 'inputAssistance'
        code_array << '[4]'
      when 'nextBetweenQuestions'
        code_array << '[5]'
      when 'numpadRemoval'
        code_array << '[6]'
      when 'questionReader'
        code_array << '[7]'
      else
        p access_arrangement
        fail 'arrangment not recognised '
      end
    end
    code_array
  end

  def calculate_not_taking_reason_code(reason)
    case reason
    when 'Incorrect registration'
      'Z'
    when 'Absent during check window'
      'A'
    when 'Left school'
      'L'
    when 'Unable to access'
      'U'
    when 'Working below expectation'
      'B'
    when 'Just arrived and unable to establish abilities'
      'J'
    else
      fail "Reason ID #{reason} - not found"
    end
  end

  def navigate_to_pupil_list_for_pin_gen(check_type)
    visit ENV['ADMIN_BASE_URL'] + tio_or_live_pins_page.url
    case check_type
    when 'tio'
      tio_or_live_pins_page.generate_tio_pins.click
      generate_pins_familiarisation_overview_page.generate_pin_btn.click if generate_pins_familiarisation_overview_page.has_generate_pin_btn?
      generate_pins_familiarisation_overview_page.generated_pin_overview.generate_additional_pins_btn.click if generate_pins_familiarisation_overview_page.generated_pin_overview.has_generate_additional_pins_btn?
    when 'live'
      tio_or_live_pins_page.generate_live_pins.click
      generate_pins_overview_page.generate_pin_btn.click if generate_pins_overview_page.has_generate_pin_btn?
      generate_pins_overview_page.generated_pin_overview.generate_additional_pins_btn.click if generate_pins_overview_page.generated_pin_overview.has_generate_additional_pins_btn?
    else
      fail 'check type not found'
    end
  end

  def start_mtc
    @check_code = (JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
    expect(SqlDbHelper.get_check(@check_code)['startedAt']).to be_nil
    mtc_check_start_page.start_now.click
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
