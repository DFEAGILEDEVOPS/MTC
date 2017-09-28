require 'httparty'
class RequestHelper
  include HTTParty

  def questions(school_pin, pupil_pin)
    self.class.post(BASE_URL+"/api/questions", :body => {:'schoolPin' => school_pin, :'pupilPin' => pupil_pin})
  end

  def admin_home
    fail 'Please check your URL it looks like it might be wrong for ADMIN' if BASE_URL.include? 'pupil'
    self.class.get(BASE_URL)
  end

  def spa_home
    fail 'Please check your URL it looks like it might be wrong for SPA' if BASE_URL.include? 'admin'
    self.class.get(BASE_URL)
  end


end
