require 'httparty'
class RequestHelper
  include HTTParty

  def questions(school_pin, pupil_pin)
    self.class.post(BASE_URL+"/api/questions", :body => {:'schoolPin' => school_pin, :'pupilPin' => pupil_pin})
  end

  def admin_home()
    self.class.get('https://admin-as-dev-mtc.azurewebsites.net/')
  end

  def spa_home()
    self.class.get('https://pupil-as-dev-mtc.azurewebsites.net/')
  end


end
