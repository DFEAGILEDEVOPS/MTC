class RequestHelper
  include HTTParty

  def self.auth(school_pin, pupil_pin, build_version=1)
    body = {'schoolPin' => school_pin, 'pupilPin' => pupil_pin}
    body['buildVersion'] = build_version unless build_version.nil?
    HTTParty.post(ENV['PUPIL_API_BASE_URL']+"/auth", :body => body.to_json, headers: {'Content-Type' => 'application/json', 'Origin' => ENV['PUPIL_BASE_URL']})
  end

end
