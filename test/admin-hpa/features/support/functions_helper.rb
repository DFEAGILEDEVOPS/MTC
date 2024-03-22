class FunctionsHelper
  include HTTParty

  def self.sync_check_code(check_code)
    HTTParty.post(ENV['FUNC_THROTTLED_BASE_URL'] + "/sync-results-init", :body => {'checkCode' => check_code}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_THROTTLED_MASTER_KEY']})
  end

  def self.generate_school_pin(school_id)
    HTTParty.post(ENV['FUNC_CONSUMP_BASE_URL'] + "/api/util-school-pin-http-service", :body => {'school_id' => school_id}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_CONSUMP_MASTER_KEY']})
  end

  def self.complete_check_via_check_code(check_code_array)
    HTTParty.post(ENV['FUNC_CONSUMP_BASE_URL'] + "/api/util-submit-check", :body => {'checkCodes': check_code_array}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_CONSUMP_MASTER_KEY']})
  end

end
