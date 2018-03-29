require 'mongo'
class MongoDbHelper

  if !AUTH.nil?
    def self.school_pin_retriever(school_id)
      collection = CLIENT[:schools].find({'_id': school_id})
      @schools = []
      collection.find {|school| @schools << school}
      @schools.first['schoolPin']
    end

    def self.pupil_pin_retriever(school_id)
      collection = CLIENT[:pupils].find({school: school_id})
      @array_of_pupils = []
      collection.each {|pin| @array_of_pupils << pin}
      @array_of_pupils.map {|pupil| pupil['pin']}
    end

  else
    def self.pin_retriever
      collection = CLIENT[:pins]
      @array_of_pins = []
      collection.find.each {|pin| @array_of_pins << pin}
      @array_of_pins
    end

    def self.pins(array_of_pins)
      array_of_pins.map {|hash| hash.values.first}
    end
  end

  def self.failed_login_attempts
    collection = CLIENT[:logonevents]
    collection.find.count
  end

  def self.get_answers(session_id)
    array_of_answers = []
    collection = CLIENT["answers-#{Date.today.year}".to_sym].find({'sessionId': session_id})
    collection.each {|a| array_of_answers << a[:answers]}
    array_of_answers
  end

  def self.get_result(session_id)
    result = []
    collection = CLIENT["answers-#{Date.today.year}".to_sym].find({'sessionId': session_id})
    collection.each {|a| result << a[:result]}
    result.compact
  end

  def self.logon_event(session_id)
    result = []
    collection=CLIENT[:logonevents].find({'sessionId': session_id})
    collection.each {|a| result << a}
    result.first
  end

  def self.get_feedback(session_id)
    result = []
    collection=CLIENT[:pupilfeedbacks].find({'sessionId': session_id})
    collection.each {|a| result << a}
    result.first
  end

  def self.get_last_answer
    collection = CLIENT["answers-#{Date.today.year}".to_sym].find().sort({createdAt:-1})
    collection.first
  end

  def self.find_next_pupil
    collection=CLIENT[:pupils].find({})
    result = []
    collection.each { |pupil| result << pupil }
    result.select{|pupil| pupil['pin'] == nil}.first
  end

  def self.find_school(school_id)
    collection=CLIENT[:schools].find({'_id': school_id})
    collection.find.each {|school| school }
  end

  def self.warm_up_test_time(pin)
    result = []
    collection = CLIENT[:pupils].find({pin: pin})
    collection.each {|a| result << a}
    result
  end

  def self.find_pupil_via_pin(pin)
    collection=CLIENT[:pupils].find({'pin': pin})
    result = []
    collection.find.each { |pupil| result << pupil }
    result.first
  end

  def self.expire_pin(forename,lastname,school_id,flag=true)
    CLIENT[:pupils].update_one({'foreName': forename, 'lastName': lastname, 'school': school_id.to_i},
                               {'$set' => {'pinExpired' => flag}})
  end

  def self.reset_pin(forename,lastname,school_id,flag=nil)
    CLIENT[:pupils].update_one({'foreName': forename, 'lastName': lastname, 'school': school_id.to_i},
                               {'$set' => {'pin' => flag}})
  end

  def self.get_completed_checks
    collection=CLIENT[:completedchecks].find({})
    result = []
    collection.each { |check| result << check }
    result
  end

  def self.get_list_of_schools
    collection=CLIENT[:schools]
    @array_of_schools = []
    collection.find.each {|school| @array_of_schools << school}
    @array_of_schools
  end

  def self.get_pupil_check_metadata(check_code)
    collection=CLIENT[:checks].find({'checkCode': check_code})
    result = []
    collection.find.each { |check| result << check }
    result.first
  end

  def self.get_check_window(check_window_id)
    collection=CLIENT[:checkwindows].find({'_id': BSON::ObjectId(check_window_id)})
    result = []
    collection.find.each { |window| result << window }
    result.first
  end

  def self.get_check_window_via_name(name)
    collection=CLIENT[:checkwindows].find({'name': name})
    result = []
    collection.find.each { |window| result << window }
    result.first
  end

  def self.get_form(form_id)
    collection=CLIENT[:checkforms].find({'_id': form_id})
    result = []
    collection.find.each { |form| result << form }
    result.first
  end

  def self.number_of_checks
    collection = CLIENT[:checks]
    collection.find.count
  end


  def self.set_pupil_pin_expiry(forename,lastname,school_id,newTime)
    CLIENT[:pupils].update_one({'foreName': forename, 'lastName': lastname, 'school': school_id.to_i},
                               {'$set' => {'pinExpiresAt' => newTime}})
  end

  def self.set_school_pin_expiry(estab_code,newTime)
    CLIENT[:schools].update_one({'estabCode': estab_code},
                                {'$set' => {'pinExpiresAt' => newTime}})
  end

  def self.find_pupil_from_school(first_name, school_id)
    collection=CLIENT[:pupils].find({foreName: first_name, school: school_id.to_i})
    result = []
    collection.each {|pupil| result << pupil}
    result.first
  end
end
