require 'httparty'
class RequestHelper
  include HTTParty

  def questions(school_pin, pupil_pin)
    self.class.post(BASE_URL+"/api/questions", :body => {:'schoolPin' => school_pin, :'pupilPin' => pupil_pin})
  end

  def admin_home()
    self.class.get('http://admin-dev-mtc.azurewebsites.net/sign-in')
  end

  def spa_home()
    self.class.get('https://pupil-dev-mtc.azurewebsites.net/sign-in')
  end


end
