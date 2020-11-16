class FunctionsHelper
  include HTTParty

  def self.trigger_func(function_name)
    HTTParty.post(ENV['FUNC_THROTTLED_BASE_URL'] + "/#{function_name}", :body => {'input' => "test"}.to_json, headers: {'Content-Type' => 'application/json'})
  end

end
