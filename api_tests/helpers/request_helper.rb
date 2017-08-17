require 'httparty'
class RequestHelper
  include HTTParty

  def questions(school_pin, pupil_pin)
    self.class.post(BASE_URL+"/api/questions", :body => {:'schoolPin' => school_pin, :'pupilPin' => pupil_pin})
  end


end
