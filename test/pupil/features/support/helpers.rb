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

end
