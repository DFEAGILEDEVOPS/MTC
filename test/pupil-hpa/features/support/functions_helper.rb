class FunctionsHelper
  include HTTParty

  def self.trigger_ps_function(function_name, input='test')
    HTTParty.post(ENV['FUNC_PS_REPORT_BASE_URL'] + "/#{function_name}", :body => {"input" => input.to_json}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_PS_REPORT_MASTER_KEY']})
  end

  def self.sync_check_code(check_code)
    HTTParty.post(ENV['FUNC_THROTTLED_BASE_URL'] + "/sync-results-init", :body => {'checkCode' => check_code}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_THROTTLED_MASTER_KEY']})
  end

  def self.sync_all
    HTTParty.post(ENV['FUNC_THROTTLED_BASE_URL'] + "/sync-results-init", :body => {'resyncAll' => true}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_THROTTLED_MASTER_KEY']})
  end

  def self.create_school(lea_code, estab_code, name, urn)
    HTTParty.put(ENV['FUNC_CONSUMP_BASE_URL'] + "/api/test-support/school", :body => {'leaCode' => lea_code, 'estabCode' => estab_code.to_s, 'name' => name, 'urn' => urn.to_s}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_CONSUMP_MASTER_KEY']})
  end

  def self.create_user(school_uuid,username)
    HTTParty.put(ENV['FUNC_CONSUMP_BASE_URL'] + "/api/test-support/user", :body => {'schoolUuid' => school_uuid, 'identifier' => username, 'password' => 'password', 'role' => 'teacher'}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_CONSUMP_MASTER_KEY']})
  end

  def self.generate_school_pin(school_id)
    HTTParty.post(ENV['FUNC_CONSUMP_BASE_URL'] + "/api/util-school-pin-http-service", :body => {'school_id' => school_id}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_CONSUMP_MASTER_KEY']})
  end

  def self.complete_check_via_check_code(check_code_array)
    HTTParty.post(ENV['FUNC_CONSUMP_BASE_URL'] + "/api/util-submit-check", :body => {'checkCodes': check_code_array}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_CONSUMP_MASTER_KEY']})
  end

  def self.complete_check_with_duplicates(check_code_array, correct_answers,incorrect_answers,duplicate_answers)
    HTTParty.post(ENV['FUNC_CONSUMP_BASE_URL'] + "/api/util-submit-check", :body => {'checkCodes': check_code_array, 'answerNumberFromCorrectCheckForm': correct_answers, 'answerNumberFromIncorrectCheckForm': incorrect_answers, 'answerNumberOfDuplicates': duplicate_answers}.to_json, headers: {'Content-Type' => 'application/json', 'x-functions-key' => ENV['FUNC_CONSUMP_MASTER_KEY']})
  end

end
