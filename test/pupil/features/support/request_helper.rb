class RequestHelper
  include HTTParty

  def self.auth(school_pin, pupil_pin)
    HTTParty.post("http://localhost:3003/auth", :body => {'schoolPin' => school_pin, 'pupilPin' => pupil_pin}.to_json, headers: {'Content-Type' => 'application/json'})
  end

end
