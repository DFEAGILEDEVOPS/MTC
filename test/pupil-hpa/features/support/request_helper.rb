class RequestHelper
  include HTTParty

  def self.auth(school_pin, pupil_pin)
    HTTParty.post(ENV['PUPIL_API_BASE_URL']+"/auth", :body => {'schoolPin' => school_pin, 'pupilPin' => pupil_pin}.to_json, headers: {'Content-Type' => 'application/json'})
  end

end
